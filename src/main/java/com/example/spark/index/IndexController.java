package com.example.spark.index;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.util.JsonUtil;
import com.example.spark.util.ViewUtil;

import spark.Request;
import spark.Response;
import spark.Route;

public class IndexController {

	public static Route serveIndexPage = (Request request, Response response) -> {
		Map<String, Object> model = new HashMap<>();
		if(request.session().attribute("userContext") == null) {
			response.redirect(Path.LOGIN);
		} else {
			model = JsonUtil.fromJson(request.session().attribute("userContext"));
		}
		return ViewUtil.render(request, model, Path.Template.INDEX);
	};
}
