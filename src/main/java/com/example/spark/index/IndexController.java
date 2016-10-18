package com.example.spark.index;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.app.Path;
import com.example.spark.auth.SessionManager;
import com.example.spark.auth.UserContext;
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
		if(!SessionManager.isUserContextSet(request)) {
			String contextPath = request.contextPath() != null ? request.contextPath() : "";
			response.redirect(contextPath + Path.LOGIN);
		}
		HashMap<String, String> links = new HashMap<String, String>();
		model.put("links", links);
		UserContext usrContext =  request.session().attribute("userContext");
		response.header("Set-Cookie", "userContext=" + usrContext);  // to be able to access the user context on the client side
		return ViewUtil.render(request, model, Path.Template.INDEX);
	};
}
