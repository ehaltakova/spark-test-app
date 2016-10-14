package com.example.spark.app;

import static spark.Spark.*;

import com.example.spark.index.IndexController;
import com.example.spark.login.LoginController;
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
		
		port(Path.PORT);
		staticFiles.location("/public");
		staticFiles.expireTime(600L);
		
		// configure static resources folder (used to store uploaded files)
		Util.configureUploadFilesDir();
		
		// enable CORS
		CORSUtil.enableCORS();
		System.out.println(Path.APP_BASE_URL);

		// set up before and after filters
		before("/spark/api/public/*", Filters.ensureSessionTokenIsValid);
		before(Filters.addResponseHeaders);
		after("/spark/api/public/*", Filters.regenerateSessionToken);
		after(Filters.logResponse);
		
		// register exception handling
		exception(Exception.class, ExceptionHandlers.uncheckedExceptions);
		
		// routes
		get(Path.INDEX, IndexController.serveIndexPage);
		get(Path.LOGIN, LoginController.serveLoginPage);
		post(Path.LOGIN, LoginController.handleLogin);
		// ajax
		post(Path.AJAX_GET_SLIDEALBUMS, SlideAlbumsController.getSlideAlbums);		
		post(Path.AJAX_CREATE_SLIDEALBUM, SlideAlbumsController.createSlideAlbum);
		post(Path.AJAX_DELETE_SLIDEALBUM, SlideAlbumsController.deleteSlideAlbum);		
		// tests
		get("/spark/api/test/slidealbum/*/*", SlideAlbumsController.getSlideAlbum);		
		get("/hello", (req, res) -> "Hello World");
	}	
}
