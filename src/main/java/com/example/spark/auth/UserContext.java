package com.example.spark.auth;

import java.util.HashMap;
import java.util.Map;

import com.example.spark.util.JsonUtil;

/**
 * User context class.
 * @author Elitza Haltakova
 *
 */
public class UserContext {
	
	private String sessionToken;
	private User user;
	
	public UserContext(String sessionToken, User user) {
		this.sessionToken = sessionToken;
		this.user = user;
	}
	
	public String getSessionToken() {
		return sessionToken;
	}
	public User getUser() {
		return user;
	}
	
	public String toJsonString() {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("sessionToken", sessionToken);
		map.put("username", user.getUsername());
		map.put("firstName", user.getFirstName());
		map.put("lastname", user.getLastName());
		map.put("id", user.getId());
		map.put("isAdmin", user.isAdmin());
		map.put("shouldChangePassword", user.shouldChangePassword());
		map.put("customers", user.getCustomers());
		return JsonUtil.toJson(map);
	}
}
