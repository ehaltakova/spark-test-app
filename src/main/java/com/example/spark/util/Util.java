package com.example.spark.util;

import java.io.File;

/**
 * Utility class providing common helper features
 * @author Elitza Haltakova
 *
 */
public class Util {

	public static String uploadDirPath = "upload";
			
	public static File configureUploadFilesDir() {
		File uploadDir = new File("upload");
	    uploadDir.mkdir(); // create the upload directory if it doesn't exist
	    uploadDirPath = uploadDir.getPath();
	    return uploadDir;
	}
}
