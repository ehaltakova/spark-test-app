package com.example.spark.auth;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.util.HTTPUtil;
import com.example.spark.util.HTTPUtil.HTTPResponse;
import com.example.spark.util.JsonUtil;

/**
 * Authentication Manager class.
 * Calls web services of the external Authentication API.
 * @author Elitza Haltakova
 *
 */
public class AuthenticationMgr {

	public HTTPResponse login(String username, String password) {	
		Map<String, Object> requestBodyData = new HashMap<String, Object>();
		requestBodyData.put("username", username);
		requestBodyData.put("password", password);
		String jsonBody = JsonUtil.toJson(requestBodyData);		
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.AUTH_API_MAIN_URL, AuthAPIPath.LOGIN, jsonBody);
		return response;
	}
	
	public HTTPResponse logout(String sessionToken) {
		Map<String, Object> requestBodyData = new HashMap<String, Object>();
		requestBodyData.put("sessionToken", sessionToken);
		String jsonBody = JsonUtil.toJson(requestBodyData);
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.AUTH_API_MAIN_URL, AuthAPIPath.LOGOUT, jsonBody);
		return response;
	}
	
	public HTTPResponse validateSessionToken(String sessionToken) {
		Map<String, Object> requestBodyData = new HashMap<String, Object>();
		requestBodyData.put("sessionToken", sessionToken);
		String jsonBody = JsonUtil.toJson(requestBodyData);
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.AUTH_API_MAIN_URL, AuthAPIPath.VALIDATE_REQUEST, jsonBody);
		return response;
	}
	
	public boolean isSessionTokenValid(String sessionToken) {
		AuthenticationMgr authMgr = new AuthenticationMgr();
		HTTPResponse response = authMgr.validateSessionToken(sessionToken);
		if(response.status == 200) {
			return true;
		}
		return false;
	}
	
	private static class AuthAPIPath {

		public static final String AUTH_API_MAIN_URL = "http://localhost:1818/SALSSA2-API/api/auth";
		
		public static final String LOGIN = "/login";
		public static final String LOGOUT = "/logout";
		public static final String VALIDATE_REQUEST = "/validateToken";
	}
}
