package com.example.spark.login;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.auth.AuthenticationMgr;
import com.example.spark.util.HTTPUtil.HTTPResponse;
import com.example.spark.util.JsonUtil;
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
		Map<String, Object> model = new HashMap<String, Object>();
		return ViewUtil.render(request, model, Path.Template.LOGIN);
	};
	
	// post /login
	public static Route handleLogin = (Request request, Response response) -> {
		Map<String, Object> requestBody = new HashMap<String, Object>();
		requestBody.put("username", request.queryParams("username"));
		requestBody.put("password", request.queryParams("password"));
		AuthenticationMgr authMgr = new AuthenticationMgr();
		HTTPResponse result = authMgr.login(JsonUtil.toJson(requestBody));
		Map<String, Object> model = new HashMap<String, Object>();
		if(result.status == 200) {
			request.session(true).attribute("userContext", result.body); // sessionMgr: login - set user context
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
		HTTPResponse result = authMgr.logout(JsonUtil.toJson(request.session().attribute("userContext")));
		Map<String, Object> model = new HashMap<String, Object>();
		if (result.status == 200) {
			request.session().removeAttribute("userContext");; // sessionMgr: clear user context
			response.redirect(Path.LOGIN);
		} else {
			model.put("msg", "An internal error occured. Please, contact your system administrator.");
			return ViewUtil.render(request, model, Path.Template.INDEX);
		}
		return null;
	};
}
