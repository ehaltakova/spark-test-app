package com.example.spark.auth;

import com.example.spark.util.HTTPUtil;
import com.example.spark.util.HTTPUtil.HTTPResponse;

/**
 * Authentication Manager - calls web services of the Authentication API
 * @author Elitza Haltakova
 *
 */
public class AuthenticationMgr {

	public HTTPResponse login(String requestBody) {
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.LOGIN, requestBody);
		return response;
	}
	
	public HTTPResponse logout(String requestBody) {
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.LOGOUT, requestBody);
		return response;
	}
	
	public HTTPResponse validateSessionToken(String requestBody) {
		HTTPResponse response = HTTPUtil.postRequest(AuthAPIPath.VALIDATE_REQUEST, requestBody);
		return response;
	}
	
	public boolean isSessionTokenValid(String sessionToken) {
		if(sessionToken != null && !sessionToken.equals("")) {
			return true;
		}
		return false;
	}
	
	// TODO
	public String regenerateSessionToken(String oldSessionToken) {
		return oldSessionToken;
	}
	
	private static class AuthAPIPath {

		private static final String AUTH_API_MAIN_URL = "http://localhost:1818/SALSSA2-API/api/auth";
		
		public static final String LOGIN = AUTH_API_MAIN_URL + "/login";
		public static final String LOGOUT = AUTH_API_MAIN_URL + "/logout";
		public static final String VALIDATE_REQUEST = AUTH_API_MAIN_URL + "/validateToken";
				
	}
}
