var API_BASE_URL = config.api_base_url;
var APP_BASE_URL = config.app_base_url;

/**
 * REST API Util.
 * Implements utility functions to handle requests/responses to SALSSA2 web services.
 */

RESTAPIUtil = function() {};

/**
 * Method to do AJAX call to a SALSSA2 REST web service:
 * - handle service request data passed
 * - set up AJAX call with correct url, method type, data and callback function
 * - handle service response
 * - handle errors (if any)
 * 
 * @param url string Web service url
 * @param type string Web service method type
 * @param data object Request data
 * @param callback function Web service successfull calback function
 * @param includeBaseRequest boolean Indicates whether the request data should include the base request or not
 */
RESTAPIUtil.prototype.execute = function(url, type, data, callback, includeBaseRequest) {
	var restApiMgr = this;
	$.ajax({
		type : type,
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		url : url,
		async : true,
		data : restApiMgr.handleRequest(data, includeBaseRequest),
		success : function(resp) {
			callback(restApiMgr.handleResponse(resp));
		},
		error : function(resp) {
			restApiMgr.handleError(resp);
		},
		dataType : "json"
	});
};

/**
 * Method to do syncronous AJAX call to a SALSSA2 REST web service:
 * - handle service request data passed
 * - set up AJAX call with correct url, method type, data and callback function
 * - handle service response
 * - handle errors (if any)
 * 
 * @param url string Web service url
 * @param type string Web service method type
 * @param data object Request data
 * @param callback function Web service successfull calback function
 * @param includeBaseRequest boolean Indicates whether the request data should include the base request or not
 */
RESTAPIUtil.prototype.executeSync = function(url, type, data, callback, includeBaseRequest) {
	var restApiMgr = this;
	$.ajax({
		type : type,
		contentType : "application/x-www-form-urlencoded",
		url : url,
		async : false,
		data : restApiMgr.handleRequest(data, includeBaseRequest),
		success : function(resp) {
			callback(restApiMgr.handleResponse(resp));
		},
		error : function(resp) {
			restApiMgr.handleError(resp);
		},
		dataType : "json"
	});
};

/**
 * Method to create base request (user and session information)
 * @return object Services base request
 */
RESTAPIUtil.prototype.createBaseRequest = function() {
	return {};
};

/**
 * Prepare service request - add base request (if requested) and parse service request to JSON string
 * @param data object Web service request data
 * @param includeBaseRequest boolean Indicates whether the request data should include the base request or not
 * @return string Service request JSON string
 */
RESTAPIUtil.prototype.handleRequest = function(data, includeBaseRequest) {
	var request = data;
	if (includeBaseRequest) {
		var baseRequest = this.createBaseRequest();
		request = $.extend(baseRequest, data);
	}
	return JSON.stringify(request);
};

/**
 * Prepare service response - parse the response to object (if result is JSON string).
 * If new session token is generated and included in the response, update session cookie with it.
 * @param response object Web service response
 * @return object The handled response parsed to object
 */
RESTAPIUtil.prototype.handleResponse = function(response) {
	return response;
};

/**
 * Handle service erros - get service response errors and display the appropriate message to the user.
 * @param response object Web service response
 */
RESTAPIUtil.prototype.handleError = function(response) {
	var errorMsg = "<b>" + response.status + " " + response.statusText + "</b>: " + response.responseText;
	displayUserNotification('danger', [ errorMsg ]);
};
