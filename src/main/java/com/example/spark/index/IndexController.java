package com.example.spark.index;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.util.JsonUtil;
import com.example.spark.util.ViewUtil;

import spark.Request;
import spark.Response;
import spark.Route;

/**
 * Index page controller.
 * @author Elitza Haltakova
 *
 */
public class IndexController {

	public static Route serveIndexPage = (Request request, Response response) -> {
		Map<String, Object> model = new HashMap<>();
		if(request.session().attribute("userContext") == null) { // sessionMgr: isUserContext set
			response.redirect(Path.LOGIN);
		} else {
			model = JsonUtil.fromJson(request.session().attribute("userContext")); // sessionMgr: get user context
		}
		HashMap<String, String> links = new HashMap<String, String>(); //TODO: check if user is admin
		links.put("User Management", "/users");
		model.put("links", links);
		return ViewUtil.render(request, model, Path.Template.INDEX);
	};
}
