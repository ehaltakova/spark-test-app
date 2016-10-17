package com.example.spark.login;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.auth.AuthenticationMgr;
import com.example.spark.auth.SessionManager;
import com.example.spark.auth.UserContext;
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
		return ViewUtil.render(request, new HashMap<String, Object>(), Path.Template.LOGIN);
	};
	
	// post /login
	public static Route handleLogin = (Request request, Response response) -> {
		
		// prepare request to external API
		Map<String, Object> requestBody = new HashMap<String, Object>();
		requestBody.put("username", request.queryParams("username"));
		requestBody.put("password", request.queryParams("password"));
		
		// call external login web service
		AuthenticationMgr authMgr = new AuthenticationMgr();
		
		// handle response and set user context
		HTTPResponse result = authMgr.login(JsonUtil.toJson(requestBody));
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
		
		// prepare request to external API
		UserContext userContext = SessionManager.getUserContext(request);
		String requestBody = userContext.toJsonString();

		System.err.println(requestBody);
		// call external login web service				
		AuthenticationMgr authMgr = new AuthenticationMgr();
		HTTPResponse result = authMgr.logout(requestBody);
		
		// handle response and clear user context
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
