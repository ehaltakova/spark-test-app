var API_BASE_URL = config['api_base_url'];
var APP_BASE_URL = config['app_base_url']; 


/**
 * Session management.
 * Implements client-side user context management and session.
 * User context is stored in a browser cookie.
 */

		
	SessionManager = function () {};

        
        /**
         * Get user context.
         */
        SessionManager.prototype.getUserContext = function () {
        	return JSON.parse(getCookie('userData')); 
        };
        
        /**
         * Set user context.
         * @param userContext User context data to be saved in a cookie
         */
        SessionManager.prototype.setUserContext = function (userContext) {
			setCookie('userData', JSON.stringify(userContext), 60);
        };
        
        /**
         * Update user context.
         * @param data User context data to be updated
         */
        SessionManager.prototype.updateUserContext = function (data) {
			var userContext = this.getUserContext();
			// set new values for the session context without changing the cookie expiration time!
			for (var key in data) {
				userContext[key] = data[key];
			}
			updateCookie('userData', JSON.stringify(userContext));
        };
        
        /**
         * Check if user context is set.
         * @return boolean True if user context is set, false otherwise
         */
        SessionManager.prototype.isSetUserContext = function () {
            return getCookie('userData') != '';
        };
        
        /**
         * Clear user context.
         */
        SessionManager.prototype.clearUserContext = function () {
        	try {
            	var table = $('#slideAlbumsTable').DataTable();	
            	if(table != null) {
                	table.state.clear();
            	}
        	} catch (e) {
        		// nothing
        	}
			setCookie('userData', '', 1);
        };
        
        /**
         * Check if current logged in user is admin.
         * @return boolean True if user has admin rights, false otherwise
         */
        SessionManager.prototype.isAdminUser = function() {
        	var userContext = this.getUserContext();
        	if(userContext == null) {
        		return false;
        	}
        	return userContext['isAdmin'] == 1;
        };
        
        /**
         * Check if current logged in user has permissions to proceed.
         * @return boolean True if user has admin rights, false otherwise
         */
        SessionManager.prototype.hasPermissions = function() {
            // Note: currently user has no permissions if he is not an admin and 
        	// when he hasn't change his service assigned password yet!
        	var userContext = this.getUserContext();
        	if(userContext == null) {
        		return false;
        	}
        	return this.isAdminUser() || userContext['shouldChangePassword'] != 1;
        };



var sessionMgr = new SessionManager(); // global context
