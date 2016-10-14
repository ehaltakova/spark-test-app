/** Called when login.html page is loaded*/
$( document ).ready(function() {
	
	// placeholders localization
	$("#username").attr("placeholder", localize("Username (Bosch Active Directory ID)"));
	$("#pass").attr("placeholder", localize("Password"));
	
	if(sessionMgr.isSetUserContext()) { // prevent double login for the same device
		window.location.href = APP_BASE_URL;
	}		
	
	// draw navbar
	drawBasicNavbar(localize("SALSSA2"), APP_BASE_URL);

	// show placehodlers in IE9
	$(function() {
		$('input, text').placeholder();
	});
	
	// validate and submit login form 
	$("#loginBtn").on('click', function(e) {	
		e.preventDefault();

		var errorMsgs = [];
		if($("#username").val().length === 0) {
			errorMsgs.push(localize('Username is required.') + '\n');
		}
		if($("#pass").val().length === 0) {
			errorMsgs.push(localize('Password is required.') + '\n');
		}
		if(errorMsgs.length > 0) {
			displayUserNotification('warning', errorMsgs);
			e.preventDefault();
			return;
		}
		
		// do login
		var username = $("#username").val().trim();
		var password = $("#pass").val().trim();
		var authManager = new AuthManager(sessionMgr);
		authManager.login(username, password);
		return false;
	});	
	
});

