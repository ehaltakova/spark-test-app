package com.example.spark.app;

import static spark.Spark.*;
import static spark.debug.DebugScreen.*;

import com.example.spark.index.IndexController;
import com.example.spark.login.LoginController;
import com.example.spark.slidealbums.SlideAlbumsController;
import com.example.spark.util.CORSUtil;
import com.example.spark.util.ConfigUtil;
import com.example.spark.util.Util;

import spark.servlet.SparkApplication;

import org.apache.log4j.Logger;
/**
 * Main API class defining all the end points
 * @author Elitza Haltakova
 *
 */
public class Application implements SparkApplication {
	
	final static Logger logger = Logger.getLogger(Application.class);
	
	public static void main(String[] args) {
		
		Application app = new Application();
		app.init();
	}

	@Override
	public void init() {
		
		// configure port and static resource files directory
		port(ConfigUtil.PORT);
		staticFiles.location("/public");
		staticFiles.expireTime(600L);
		
		// enable debug screen if application is in DEV mode
		if(ConfigUtil.appMode.name().equals("DEV")) {
			enableDebugScreen();
		}
		
		// set up upload folder
		Util.setUpUploadDir();
		
		// enable CORS
		CORSUtil.enableCORS();

		// set up before and after filters
		before("/spark/api/*", Filters.ensureSessionTokenIsValid);
		before(Filters.addResponseHeaders);
		after(Filters.logResponse);
		
		// register exception handlers
		exception(Exception.class, ExceptionHandlers.uncheckedExceptions);
		
		// routes
		get(Path.INDEX, IndexController.serveIndexPage);
		get(Path.LOGIN, LoginController.serveLoginPage);
		post(Path.LOGIN, LoginController.handleLogin);
		get(Path.LOGOUT, LoginController.handleLogout);
		// ajax
		post(Path.AJAX_GET_SLIDEALBUMS, SlideAlbumsController.getSlideAlbums);		
		post(Path.AJAX_CREATE_SLIDEALBUM, SlideAlbumsController.createSlideAlbum);
		post(Path.AJAX_DELETE_SLIDEALBUM, SlideAlbumsController.deleteSlideAlbum);		
		// tests
		get("/spark/test/slidealbum/*/*", SlideAlbumsController.getSlideAlbum);		
		get("/hello", (req, res) -> "Hello World");
	}	
}
