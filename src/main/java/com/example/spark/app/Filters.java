package com.example.spark.app;

import java.util.HashMap;

import com.example.spark.auth.AuthenticationMgr;
import com.example.spark.util.JsonUtil;

import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Spark;

/**
 * Before and after filters for the API endpoints (middleware)
 * @author Elitza Haltakova
 *
 */
public class Filters {

	private static AuthenticationMgr authMgr = new AuthenticationMgr();

	/**
	 * Before filter
	 * Check if session token passed in the request is valid.
	 */
	public static Filter ensureSessionTokenIsValid = (Request request, Response response) -> {
		HashMap<String, Object> requestData = JsonUtil.fromJson(request.body());
		if(requestData == null) {
			Spark.halt(403, "Invalid request.");
		}
		String sessionToken = requestData.get("sessionToken") != null ? (String) requestData.get("sessionToken") : null;
		if(sessionToken == null || !authMgr.isSessionTokenValid(sessionToken)) {
			Spark.halt(401, "Your session is invalid or expired. Please, login again.");
		}
	};
	
	/**
	 * Before filter
	 * Add content type and CORS needed headers to the response.
	 */
	public static Filter addResponseHeaders = (Request request, Response response) -> {
		if(RequestUtil.clientAcceptsHtml(request)) {
			response.header("Content-Type", "text/html");
		} else if(RequestUtil.clientAcceptsJson(request)) {
			response.header("Content-Type", "application/json");
		}
	};
	
	/**
	 * After filter
	 * Regenerate session token and put the new one into the response
	 */
	public static Filter regenerateSessionToken = (Request request, Response response) -> {
		if(response.raw().getStatus() == 200) {
			HashMap<String, Object> requestData = JsonUtil.fromJson(request.body());
			String oldSessionToken = requestData.get("sessionToken") != null ? (String) requestData.get("sessionToken") : null;
			String newSessionToken = authMgr.regenerateSessionToken(oldSessionToken);
			HashMap<String, Object> responseData = JsonUtil.fromJson(response.body());
			responseData.put("sessionToken", newSessionToken);
			response.body(JsonUtil.toJson(responseData));
		}
	};

	/**
	 * After filter.
	 * Logs response status and body to the log file and the console.
	 */
	public static Filter logResponse = (Request request, Response response) -> {
		if(response.raw().getStatus() == 200) {
			Application.logger.debug(request.pathInfo() + ": " + response.raw().getStatus());
			Application.logger.debug(response.body());
		} else {
			Application.logger.error(request.pathInfo() + ": " + response.raw().getStatus());
			Application.logger.error(response.body());
		}
	};
	
	/**
	 * Before filter
	 * If a user manually manipulates paths and forgets to add a trailing slash, 
	 * redirect the user to the correct path.
	 */
	public static Filter addTrailingSlashes = (Request request, Response response) -> {
        if (!request.pathInfo().endsWith("/")) {
            response.redirect(request.pathInfo() + "/");
        }
    };
    
    /**
     * After filter
     * Enable GZIP for all responses.
     */
    public static Filter addGzipResponseHeader = (Request request, Response response) -> {
        response.header("Content-Encoding", "gzip");
    };
}
