package com.example.spark.app;

public class Path {

	private static final String HOST = "http://localhost";
	public static final int PORT = 6789;
	private static final String APP_NAME = "";
	public static final String APP_BASE_URL = APP_NAME.equals("") ? HOST + ":" + PORT : HOST + ":" + PORT + "/" + APP_NAME;
		
	public static final String INDEX = "/index";
	public static final String LOGIN = "/login";
	
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
	
	public static class Template {
        public final static String INDEX = "/velocity/index/index.vm";
        public final static String LOGIN = "/velocity/login/login.vm";
    }
}
