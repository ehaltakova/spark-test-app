var API_BASE_URL = config['api_base_url'];
var APP_BASE_URL = config['app_base_url']; 

/**
 * Authentication management.
 * Implements login and logout functions.
 * Access external REST authentication API.
 */
		
	AuthManager = function (sessionMgr) {
		this.sessionMgr = sessionMgr;
	};

   		
    	/**
    	 * Login user with username and password:
    	 * - call login REST WS;
    	 * - store user and session information returned on success in the user context;
    	 * - redirect to home page URL.
    	 * @param username string Username provided
    	 * @param pass string Password provided
    	 */
    	AuthManager.prototype.login = function (username, pass) {  	
    		
    		var sessionMgr = this.sessionMgr;		  		
    		var url = API_BASE_URL + '/api/auth/login';
    		var type = 'POST';	 
    		var data = {'username': username, 'password': pass}; // request data
    		var loginCallback = function(resp) { //login success callback
				var usrData = {
					'id': resp['id'],
					'username': resp['username'],
					'firstname': resp['firstname'],
					'lastname': resp['lastname'],
					'isAdmin': resp['isAdmin'],
					'shouldChangePassword': resp['shouldChangePassword'],
					'customers': resp['customers'],
					'sessionToken': resp['sessionToken']
				};
				sessionMgr.setUserContext(usrData); // set user context
				window.location.href = APP_BASE_URL; // redirect to home page
    		};	
    		
    		// call login WS
    		$.ajax({
    			type: type,
    			contentType: "application/x-www-form-urlencoded",
    			url: url,     
    			async: true,
    			data: JSON.stringify(data),
    			success: function(response) {
        			loginCallback(response);
    			},
    			error: function(response) {
    				var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
    	        	if(response.status == 401) {
    	        		errorMsg = response.status + " " + response.statusText + ": " + localize("Invalid credentials. Please, try again.");
    	        	} else if(response.status == 403) {
    	        		window.location.href = APP_BASE_URL + "/error";
    				}
    	        	displayUserNotification('danger', [errorMsg]);
    			},
    			dataType: "json"               
    		});
        };
        
        /**
         *  Logout current user:
         *  - call logout REST WS;
         *  - clear user contex on success;
         *  - redirect to the login page URL.
         */
        AuthManager.prototype.logout = function () {
        	
        	var sessionMgr = this.sessionMgr;		  		
        	var currentUser = sessionMgr.getUserContext();
    		var url = API_BASE_URL + '/api/auth/logout';
    		var type = 'POST';	 
    		var data = {'id': currentUser.id, 'sessionToken': currentUser['sessionToken']}; // request data    		
    		var logoutCallback = function(response) { // logout sucess callback
    			sessionMgr.clearUserContext(); // clear user context
        		window.location.href = APP_BASE_URL + "/login"; // redirect to login page
    		};
    		
    		// call logout WS
    		$.ajax({
    			type: type,
    			contentType: "application/x-www-form-urlencoded",
    			url: url,     
    			async: true,
    			data: JSON.stringify(data),
    			success: function(response) {
    				logoutCallback(response);
    			},
    			error: function(response) {
    				var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
    	        	displayUserNotification('danger', [errorMsg]);
    			},
    			dataType: "json"               
    		});
        };
        
        /**
         * Validate user's session token.
         */
        AuthManager.prototype.validateSessionToken = function () {
      		
    		var sessionMgr = this.sessionMgr;		  
        	var currentUser = sessionMgr.getUserContext();
    		var url = API_BASE_URL + '/api/auth/validateToken';
    		var type = 'POST';	 
    		var data = {'id': currentUser.id, 'sessionToken': currentUser['sessionToken']}; // request data
    		
    		// call validate session token WS
    		$.ajax({
    			type: type,
    			contentType: "application/x-www-form-urlencoded",
    			url: url,     
    			async: true,
    			data: JSON.stringify(data),
    			success: function(response) {
    				// nothing
    			},
    			error: function(response) {
    				var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
    	        	displayUserNotification('danger', [errorMsg]);
    			},
    			dataType: "json"               
    		});
        };
