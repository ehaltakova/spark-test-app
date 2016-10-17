package com.example.spark.util;

/**
 * Application Configuration.
 * @author Elitza Haltakova
 *
 */
public class ConfigUtil {

	public static final String HOST = "http://localhost";
	public static final int PORT = 6789;
	public static final String APP_NAME = "";
	
	public static final String WORKSPACES_DIR = "D:/xampp-7/htdocs/workspaces";
	
	public static final ApplicationMode appMode = ApplicationMode.DEV;
	
	public static final String UPLOAD_DIR = "upload";
			
	public enum ApplicationMode {
		PROD,
		DEV;
	}
}
