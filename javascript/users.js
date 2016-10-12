/** Called when users.html page is loaded*/
$( document ).ready(function() {
	
	if(sessionMgr.isSetUserContext() == false) { // redirect to login page if user is not logged in
		window.location.href = APP_BASE_URL + "/login";
	} else {
		if(!sessionMgr.isAdminUser()) { // page is not accessible by no admin users
			window.location.href = APP_BASE_URL + "/accessNotAllowed";
		}
	}
	var authManager = new AuthManager(sessionMgr);
	
	// draw page navbar
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, {}, '.usr-mng-link', sessionMgr.getUserContext(), authManager);
	
	// load and display users
	var usersManager = new UsersManager();
	usersManager.getUsers();
	
	// tooltips localization
	$("#createNewUser").attr("title", localize("Create New User"));
	
	// placeholders localization
	$(".user-name").attr("placeholder", localize("Bosch Active Directory ID"));
	$(".user-first-name").attr("placeholder", localize("First Name"));
	$(".user-last-name").attr("placeholder", localize("Last Name"));
	$(".user-pass").attr("placeholder", localize("Password"));
});