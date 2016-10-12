/** Called when index.html page is loaded
*/

$( document ).ready(function() {
	
	// placeholders localization
	$("#title").attr("placeholder", localize("Title"));
	$("#editTitle").attr("placeholder", localize("Title"));
	$("#editFilename").attr("placeholder", localize("File Name"));

	// check if user is logged in
	if(sessionMgr.isSetUserContext() == false) { // redirect to login page if user is not logged in
		window.location.href = APP_BASE_URL + "/login";
	}
	var authManager = new AuthManager(sessionMgr);

	// draw page navbar
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, [], '.home-page-link', sessionMgr.getUserContext(), authManager);

	// prompt for changing password before accessing the application
	if(!sessionMgr.isAdminUser() && !sessionMgr.hasPermissions()) {
		window.location.href = APP_BASE_URL + "/user";
		return;
	}
	
	// show placehodlers in IE9
	$(function() {
		$('input, text').placeholder();
	});
			
	// load and display slide albums
	var slideAlbumsMgr = new SlideAlbumsManager();
	slideAlbumsMgr.getSlideAlbums();
	
});