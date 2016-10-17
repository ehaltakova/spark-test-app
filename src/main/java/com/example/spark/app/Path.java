package com.example.spark.app;

import com.example.spark.util.ConfigUtil;

/**
 * Application routes and API end points.
 * @author Elitza Haltakova
 *
 */
public class Path {

	public static final String APP_BASE_URL = ConfigUtil.APP_NAME.equals("") ? ConfigUtil.HOST + ":" + ConfigUtil.PORT : ConfigUtil.HOST + ":" + ConfigUtil.PORT + "/" + ConfigUtil.APP_NAME;
		
	// application urls
	public static final String INDEX = "/index";
	public static final String LOGIN = "/login";
	public static final String USERS = "/users";
	public static final String USER = "/user/";
	public static final String LOGOUT = "/logout";
	
	// api end points
	private static final String API = "/spark/api";
	public static final String AJAX_GET_SLIDEALBUMS = API + "/public/slidealbums";
	public static final String AJAX_DELETE_SLIDEALBUM = API + "/public/slidealbums/delete";
	public static final String AJAX_CREATE_SLIDEALBUM = API + "/slidealbums/create";
	public static final String AJAX_GET_SLIDEALBUM = API + "test/slidealbum/*/*";

	public static String getAppBaseUrl() {
		return APP_BASE_URL;
	}

	public static String getIndex() {
		return INDEX;
	}

	public static String getLogin() {
		return LOGIN;
	}
	
	public static String getUsers() {
		return USERS;
	}

	public static String getUser() {
		return USER;
	}

	public static String getLogout() {
		return LOGOUT;
	}
	
	// template files paths
	public static class Template {
        public final static String INDEX = "/velocity/index/index.vm";
        public final static String LOGIN = "/velocity/login/login.vm";
    }
}
