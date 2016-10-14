/** Called when slidealbum.html page is loaded
*/
$( document ).ready(function() {
	
	// tooltips localization
	$("#helpTextImg").attr("title", localize("Click to view additional information"));
	$("#saveCircTypesData").attr("title", localize("Save circuit types definitions"));
	
	// placeholders localization
	$("#circuitTitle").attr("placeholder", localize("***[circuit title here]***"));
	$("#stepTitle").attr("placeholder", localize("[initial Slide]"));
	
	if(sessionMgr.isSetUserContext() == false) { // redirect to login page if user is not logged in
		window.location.href = APP_BASE_URL + "/login";
	}
	var authManager = new AuthManager(sessionMgr);

	var queryString = decodeURIComponent(window.location.search.substring(1));

	var title = getDecodedURLParam(queryString, 'title');
	var customer = getDecodedURLParam(queryString, 'customer');
	var readOnly = getDecodedURLParam(queryString, 'readOnly');

	var links = [];
	var link = {};
	link.name = title;
	link.cssClass = "slide-album-page-link";
	link.url = window.location.href;
	links.push(link);
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, links, '.slide-album-page-link', sessionMgr.getUserContext(), authManager);
	
	// static UI				
	$("#helpText").on('click', function() {
	  	var link = config['link_to_help'];
		var html = localize("The first slide represents the printed version of the schematic and shows 'at rest' relay and switch positions highlighted in red. This slide has no animation.") + " <br>" + 
	    		   localize("Note: this slide cannot be deleted.") + " <br> " +
	    		   localize("Important: verify that the schematic is correct before continuing.") + " <br><br>" +		    
	    		   localize("PAN: Hold Alt key and drag mouse over schematic") + " <br>" +
	    	       localize("ZOOM: Hold Ctrl key and drag mouse over schematic") + " <br><br>" +
	    	       "<a id='linkToHelp' href='javascript: window.open(\"" + link + "\",\"_blank\");'><b>" + localize("Link to Help Page") + "</b></a>";
		bootbox.alert(html);
	});	   		
	
	// get the slide album
	slideAlbumMgr = new SlideAlbumMgr();
	slideAlbumMgr.open(title, customer, readOnly);

});
