package com.example.spark.app;

import static spark.Spark.*;

import com.example.spark.index.IndexController;
import com.example.spark.slidealbums.SlideAlbumsController;
import com.example.spark.util.CORSUtil;
import com.example.spark.util.Util;

import org.apache.log4j.Logger;
/**
 * Main API class defining all the end points
 * @author Elitza Haltakova
 *
 */
public class Application {
	
	final static Logger logger = Logger.getLogger(Application.class);
	
	public static void main(String[] args) {
		
		port(6789);
		staticFiles.location("/public");
		staticFiles.expireTime(600L);
		
		// configure static resources folder (used to store uploaded files)
		Util.configureUploadFilesDir();
		
		// enable CORS
		CORSUtil.enableCORS();
		
		// set up before and after filters
		before("/spark/api/public/*", Filters.ensureSessionTokenIsValid);
		before(Filters.addResponseHeaders);
		after("/spark/api/public/*", Filters.regenerateSessionToken);
		after(Filters.logResponse);
		
		// register exception handling
		exception(Exception.class, ExceptionHandlers.uncheckedExceptions);
		
		// routes
		get(Path.INDEX, IndexController.serveIndexPage);
		post(Path.GET_SLIDEALBUMS, SlideAlbumsController.getSlideAlbums);		
		post(Path.CREATE_SLIDEALBUM, SlideAlbumsController.createSlideAlbum);
		post(Path.DELETE_SLIDEALBUM, SlideAlbumsController.deleteSlideAlbum);		
		// tests
		get("/spark/api/test/slidealbum/*/*", SlideAlbumsController.getSlideAlbum);		
		get("/hello", (req, res) -> "Hello World");
	}	
}
