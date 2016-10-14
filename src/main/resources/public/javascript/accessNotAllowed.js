/** Called when error.html page is loaded
*/

$( document ).ready(function() {
	
	var authManager = new AuthManager(sessionMgr);
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, [], '.home-page-link', sessionMgr.getUserContext(), authManager);

	var errorMsg = localize("<h3>Permissions Violation</h3><h4> You are not allowed to access this page. </h4> \n");
	displayUserNotification('danger', [errorMsg]);
});