package com.example.spark.auth;

public class AuthAPIPath {

	private static final String AUTH_API_MAIN_URL = "http://localhost:1818/SALSSA2-API/api/auth";
	
	public static final String LOGIN = AUTH_API_MAIN_URL + "/login";
	public static final String LOGOUT = AUTH_API_MAIN_URL + "/logout";
	public static final String VALIDATE_REQUEST = AUTH_API_MAIN_URL + "/validateToken";
			
}
