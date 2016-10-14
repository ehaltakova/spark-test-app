/** Called when index.html page is loaded
*/
$( document ).ready(function() {
	
	// placeholders localization
	$("#title").attr("placeholder", localize("Title"));
	$("#editTitle").attr("placeholder", localize("Title"));
	$("#editFilename").attr("placeholder", localize("File Name"));

	// check if user is logged in
//	if(sessionMgr.isSetUserContext() == false) { // redirect to login page if user is not logged in
//		window.location.href = APP_BASE_URL + "/login";
//	}
	
	var userContext = {
			'id': "2",
			'username': "ehalt",
			'firstname': "Elitza",
			'lastname': "Haltakova",
			'isAdmin': 1,
			'shouldChangePassword': 0,
			'customers': ["Bosch", "Harley Davidson"],
			'sessionToken': "exampleToken123"
		};
	sessionMgr.setUserContext(userContext);
	var authManager = new AuthManager(sessionMgr);

	// draw page navbar
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, [], '.home-page-link', userContext, authManager);

//	// prompt for changing password before accessing the application
//	if(!sessionMgr.isAdminUser() && !sessionMgr.hasPermissions()) {
//		window.location.href = APP_BASE_URL + "/user";
//		return;
//	}
	
	// show placehodlers in IE9
	$(function() {
		$('input, text').placeholder();
	});
			
	// load and display slide albums
	var slideAlbumsMgr = new SlideAlbumsManager();
	slideAlbumsMgr.getSlideAlbums();
	
});