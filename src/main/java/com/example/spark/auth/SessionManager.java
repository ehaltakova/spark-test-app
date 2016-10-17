package com.example.spark.auth;

import java.util.List;

import com.example.spark.util.JsonUtil;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import spark.Request;

public class SessionManager {

	public static void setUserContext(Request request, String userContextAsJsonStr) {
		JsonObject jsonBody = JsonUtil.fromJsonToClass(userContextAsJsonStr, JsonObject.class);
		String sessionToken = jsonBody.get("sessionToken").getAsString();
		int id = jsonBody.get("id").getAsInt();
		String username = jsonBody.get("username").getAsString();
		String firstName = jsonBody.get("firstname").getAsString();
		String lastName = jsonBody.get("lastname").getAsString();
		boolean admin = jsonBody.get("isAdmin").getAsString().equals("1");
		boolean changePassword = jsonBody.get("shouldChangePassword").getAsString().equals("1");
		List<String> customers = JsonUtil.fromJsonElementToType(jsonBody.get("customers"), new TypeToken<List<String>>(){}.getType());
		User user = new User(id, username, firstName, lastName, admin, changePassword, customers);
		UserContext userContext = new UserContext(sessionToken, user);
		request.session(true).attribute("userContext", userContext);
	}
	
	public static UserContext getUserContext(Request request) {
		return request.session().attribute("userContext");
	}
	
	public static void clearUserContext(Request request) {
		request.session().removeAttribute("userContext");
	}
	
	public static boolean isUserContextSet(Request request) {
		return request.session().attribute("userContext") != null;
	}
}
