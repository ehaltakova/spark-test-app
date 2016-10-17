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
import com.example.spark.auth.SessionManager;
import com.example.spark.util.ConfigUtil;
import com.example.spark.util.JsonUtil;

import spark.*;

public class SlideAlbumsController {

	private static SlideAlbumsMgr slideAlbumsMgr = new SlideAlbumsMgr();;
	final static Logger logger = Logger.getLogger(Application.class);
	
	public static Route getSlideAlbums = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Get Slidealbums");
		logger.debug(request.body());
		List<SlideAlbum> slideAlbums = slideAlbumsMgr.getSlideAlbums(SessionManager.getUserContext(request).getUser().getCustomers());
		return JsonUtil.toJson(slideAlbums);
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
		FileItem item = items.stream().filter(e -> "files[]".equals(e.getFieldName())).findFirst().get();
		String fileName = item.getName();
		item.write(new File(uploadDir, fileName));
		if(title == null || customer == null || fileName == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your system administrator.").getMessage());
		}
		
		SlideAlbum slidealbum = slideAlbumsMgr.createSlideAlbum(title, customer, fileName);
		
		if(slidealbum == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("An error occured. Slide album was not created successfully.").getMessage());
		}
		response.header("Content-Type", "application/json");
		return JsonUtil.toJson(slidealbum);
	};

	public static Route deleteSlideAlbum = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Delete Slidealbum");
		logger.debug(request.body());
		HashMap<String, Object> data = JsonUtil.fromJson(request.body());
		if(data == null || data.get("title") == null || data.get("customer") == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your system administrator.").getMessage());
		}
		String title = (String) data.get("title");
		String customer = (String) data.get("customer");
		boolean success = slideAlbumsMgr.deleteSlideAlbum(title, customer);
		if(!success) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("An error occured. Slide album was not deleted successfully. Please, contact your system administrator.").getMessage());	
		}
		response.status(200);
		return JsonUtil.toJson("");
	};

	public static Route getSlideAlbum = (Request request, Response response) -> {
		logger.debug(request.pathInfo() + "  Get Slidealbum");
		logger.debug(request.body());
		if(request.splat() == null || request.splat().length < 2) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("Invalid request. Please, contact your administrator.").getMessage());
		}
		String customer = request.splat()[0];
		String title = request.splat()[1];
		SlideAlbum slideAlbum = slideAlbumsMgr.getSlideAlbum(title, customer);
		if (slideAlbum == null) {
			response.status(400);
			return JsonUtil.toJson(new ResponseError("No slide album with the title %s was found.", title).getMessage());
		}
		return JsonUtil.toJson(slideAlbum);
	};
}
