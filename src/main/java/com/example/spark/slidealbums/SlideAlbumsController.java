package com.example.spark.slidealbums;

import java.io.File;
import java.util.HashMap;
import java.util.List;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import com.example.spark.app.Application;
import com.example.spark.app.ResponseError;
import com.example.spark.auth.AuthenticationMgr;
import com.example.spark.util.ConfigUtil;
import com.example.spark.util.JsonUtil;

import spark.*;

public class SlideAlbumsController {

	private static SlideAlbumsMgr slideAlbumsMgr = new SlideAlbumsMgr();;
	final static Logger logger = Logger.getLogger(Application.class);
	
	public static Route getSlideAlbums = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Get Slidealbums");
		logger.debug(request.body());
		// handle request
		HashMap<String, Object> data = JsonUtil.fromJson(request.body());
		if (data == null || data.get("customers") == null) {
			response.status(400);
			return JsonUtil.toJson(
					new ResponseError("Invalid request. Please, contact your system administrator.").getMessage());
		}
		@SuppressWarnings("unchecked")
		List<String> customers = (List<String>) data.get("customers");

		// call business function
		List<SlideAlbum> slideAlbums = slideAlbumsMgr.getSlideAlbums(customers);

		// handle response
		HashMap<String, Object> responseData = new HashMap<String, Object>();
		responseData.put("slideAlbums", slideAlbums);
		return JsonUtil.toJson(responseData);
	};
	
	public static Route createSlideAlbum = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Create Slidealbum");
		logger.debug(request.body());
		
		File uploadDir = new File(ConfigUtil.UPLOAD_DIR);
		// apache commons-fileupload to handle file upload with multi part request
		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setRepository(uploadDir);
		ServletFileUpload fileUpload = new ServletFileUpload(factory);
		List<FileItem> items = fileUpload.parseRequest(request.raw());

		String title = items.stream().filter(e -> "title".equals(e.getFieldName())).findFirst().get().getString();
		String customer = items.stream().filter(e -> "customer".equals(e.getFieldName())).findFirst().get().getString();
		String sessionToken = items.stream().filter(e -> "sessionToken".equals(e.getFieldName())).findFirst().get().getString();
		FileItem item = items.stream().filter(e -> "files[]".equals(e.getFieldName())).findFirst().get();
		String fileName = item.getName();
		item.write(new File(uploadDir, fileName));
		
		// handle request
		AuthenticationMgr authMgr = new AuthenticationMgr();
		if(sessionToken == null || !authMgr.isSessionTokenValid(sessionToken)) {
			Spark.halt(401, "Your session is invalid or expired. Please, login again.");
		}
		if(title == null || customer == null || fileName == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your system administrator.").getMessage());
		}
		
		// call business function
		SlideAlbum slidealbum = slideAlbumsMgr.createSlideAlbum(title, customer, fileName);
		
		// handle response
		if(slidealbum == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("An error occured. Slide album was not created successfully.").getMessage());
		}
		sessionToken = authMgr.regenerateSessionToken(sessionToken);
		HashMap<String, Object> responseData = new HashMap<String, Object>();
		responseData.put("sessionToken", sessionToken);
		responseData.put("slideAlbum", slidealbum);
		response.header("Content-Type", "application/json");
		return JsonUtil.toJson(responseData);
	};

	public static Route deleteSlideAlbum = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Delete Slidealbum");
		logger.debug(request.body());
		
		// handle request
		HashMap<String, Object> data = JsonUtil.fromJson(request.body());
		if(data == null || data.get("title") == null || data.get("customer") == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your system administrator.").getMessage());
		}
		String title = (String) data.get("title");
		String customer = (String) data.get("customer");
		
		// call business function
		boolean success = slideAlbumsMgr.deleteSlideAlbum(title, customer);
		
		// handle response
		if(!success) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("An error occured. Slide album was not deleted successfully. Please, contact your system administrator.").getMessage());	
		}
		return "";
	};

	public static Route getSlideAlbum = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Get Slidealbum");
		logger.debug(request.body());
		
		// handle request
		if(request.splat() == null || request.splat().length < 2) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your administrator.").getMessage());
		}
		String customer = request.splat()[0];
		String title = request.splat()[1];
		// call business function
		SlideAlbum slideAlbum = slideAlbumsMgr.getSlideAlbum(title, customer);
		// handle response
		if (slideAlbum == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("No slide album with the title %s was found.", title).getMessage());
		}
		return JsonUtil.toJson(slideAlbum);
	};
}
