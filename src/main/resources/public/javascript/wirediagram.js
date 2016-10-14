/** Called when wirediagram.html page is loaded*/
$( document ).ready(function() {
	
	var queryString = decodeURIComponent(window.location.search.substring(1));

	var title = getDecodedURLParam(queryString, 'title');
	var customer = getDecodedURLParam(queryString, 'customer');
	var file =  getDecodedURLParam(queryString, 'fileName');
	
	var links = [];
	var link = {};
	link.name = title;
	link.cssClass = "slide-album-page-link";
	link.url = window.location.href;
	links.push(link);
	drawNavbar(localize("AWD Viewer"), "./viewer.html?" + encodeURIComponent("customer=" + customer), links, '.slide-album-page-link', null, null);
	
	var wireDiagramMgr = new WireDiagramMgr();
	wireDiagramMgr.openWireDiagram(title, customer, file);

});