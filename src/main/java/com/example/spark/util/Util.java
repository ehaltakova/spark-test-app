package com.example.spark.util;

import java.io.File;

/**
 * Utility class providing common helper features
 * @author Elitza Haltakova
 *
 */
public class Util {
			
	public static File setUpUploadDir() {
		File uploadDir = new File(ConfigUtil.UPLOAD_DIR);
	    uploadDir.mkdir(); // create the upload directory if it doesn't exist
	    return uploadDir;
	}
}
