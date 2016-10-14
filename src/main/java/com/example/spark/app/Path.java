package com.example.spark.app;

public class Path {

	public static final String PATH = "/spark/api";
	
	public static final String INDEX = "/index";
	public static final String LOGIN = "/login";
	public static final String GET_SLIDEALBUMS = PATH + "/public/slidealbums";
	public static final String DELETE_SLIDEALBUM = PATH + "/public/slidealbums/delete";
	public static final String CREATE_SLIDEALBUM = PATH + "/slidealbums/create";
	public static final String GET_SLIDEALBUM = PATH + "test/slidealbum/*/*";

	public static class Template {
        public final static String INDEX = "/velocity/index/index.vm";
    }
}
