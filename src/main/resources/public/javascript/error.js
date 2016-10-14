/** Called when error.html page is loaded
*/

$( document ).ready(function() {
	
	drawBasicNavbar(localize("SALSSA2", APP_BASE_URL));

	sessionMgr.clearUserContext();
	var errorMsg = localize("Your session is invalid or expired. Please, login again. \n");
	errorMsg += "<a id='login_link' href='" + APP_BASE_URL + "''><b>" + localize("Go to Login page") + "</b></a>";
	displayUserNotification('danger', [errorMsg]);
});