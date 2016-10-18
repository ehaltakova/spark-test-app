package com.example.spark.login;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.auth.AuthenticationMgr;
import com.example.spark.auth.SessionManager;
import com.example.spark.util.HTTPUtil.HTTPResponse;

import com.example.spark.util.ViewUtil;

import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Login/Logout Controller.
 * @author Elitza Haltakova
 *
 */
public class LoginController {

	// get /login
	public static Route serveLoginPage = (Request request, Response response) -> {
		if(SessionManager.isUserContextSet(request)) {
			response.redirect(Path.INDEX);
		}
		return ViewUtil.render(request, new HashMap<String, Object>(), Path.Template.LOGIN);
	};
	
	// post /login
	public static Route handleLogin = (Request request, Response response) -> {
		AuthenticationMgr authMgr = new AuthenticationMgr();
		HTTPResponse result = authMgr.login(request.queryParams("username"), request.queryParams("password"));
		Map<String, Object> model = new HashMap<String, Object>();
		if(result.status == 200) {
			SessionManager.setUserContext(request, result.body);
			response.redirect(Path.INDEX);
		} else {
			if(result.status == 401) {
				model.put("msg", "Invalid credentials. Please, try again.");
				return ViewUtil.render(request, model, Path.Template.LOGIN);
			} else {
				model.put("msg", "An internal error occured. Please, contact your system administrator.");
				return ViewUtil.render(request, model, Path.Template.LOGIN);
			}
		}
		return null;
	};
	
	// get /logout
	public static Route handleLogout = (Request request, Response response) -> {		
		AuthenticationMgr authMgr = new AuthenticationMgr();
		HTTPResponse result = authMgr.logout(SessionManager.getUserContext(request).getSessionToken());		
		if (result.status == 200) {
			SessionManager.clearUserContext(request);
			response.redirect(Path.LOGIN);
		} else {
			Map<String, Object> model = new HashMap<String, Object>();
			model.put("msg", "An internal error occured. Please, contact your system administrator.");
			return ViewUtil.render(request, model, Path.Template.INDEX);
		}
		return null;
	};
}
