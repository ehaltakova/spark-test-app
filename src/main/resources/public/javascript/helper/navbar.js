/**
 * Navbar creation functions.
 */

/**
 * Draw basic navbar with application title and logo.
 * @param title string Application title to be displayed on the navbar
 * @param homeUrl string The url to the application home page
 */
function drawBasicNavbar(title, homeUrl) {
	var html = '<nav class="navbar navbar-default  navbar-fixed-top"> ' + 
				    '<div class="container">' +
					    '<div class="navbar-header pull-left">' + 
					      '<a class="navbar-brand home-page-link" href="#">' + title + '</a>' + 
					    '</div>' + 
					    '<div class="navbar-header pull-right">' + 
					      '<ul class="nav navbar-nav">' +
					        '<li><a href="#" class="home-page-link" style="margin:0px 0px 0px 20px;padding:0px;"><img style="height:50px;" src="images/bosch-logo.jpg"></a></li>' + 			
					      '</ul>' + 
					    '</div>' +
					  '</div>' +
				'</nav>';
	$('body').prepend(html);
	$('.home-page-link').attr('href', APP_BASE_URL);
}

/**
 * Draw basic navbar with application title, logo and Home link. 
 * If userContext and authManager arguments are set draw and handle user info and logout link.
 * If user is logged in and has admin rights draw and handle the User Management link.
 * Draw and handle the additional links specified in the links argument.
 * @param title string Application title to be displayed on the navbar
 * @param homeUrl string The url to the application home page
 * @param links string Additional navbar links to be shown
 * @param activeLink string The css class of the active navbar link
 * @param userContext 
 * @param authManager 
 */
function drawNavbar(title, homeUrl, links, activeLink, userContext, authManager) {
	
	// navbar with title, logo and Home link
	var html = '<nav class="navbar navbar-default  navbar-fixed-top"> ' + 
				    '<div class="container">' +
					    '<div class="navbar-header pull-left">' + 
						    '<button type="button" class="navbar-toggle pull-left" data-toggle="collapse" data-target="#salssaNavbar">' +
						        '<span class="sr-only">Toggle navigation</span>' + 
						        '<span class="icon-bar"></span>' + 
						        '<span class="icon-bar"></span>' + 
						        '<span class="icon-bar"></span>' + 
					        '</button>' +
					      '<a class="navbar-brand home-page-link" href="#">' + title + '</a>' + 
					    '</div>' + 
					    '<div class="navbar-header pull-right">' + 
					      '<ul class="nav navbar-nav">' +
					        '<li><a href="#" class="home-page-link" style="margin:0px 0px 0px 20px;padding:0px;"><img style="height:50px;" src="images/bosch-logo.jpg"></a></li>' + 			
					      '</ul>' + 
					    '</div>' +
					    '<div class="collapse navbar-collapse" id="salssaNavbar">' + 
					      '<ul class="nav navbar-nav">' + 
					        '<li><a id="homePageRef" class="home-page-link" href="#"> ' + localize("Home") + ' <span class="sr-only">(current)</span></a></li>' + 
					      '</ul>' + 
					    '</div>' + 
					  '</div>' +
				'</nav>';
	$('body').prepend(html);
	$('.home-page-link').attr('href', homeUrl);
	
	// draw additional links
	for(var i=0; i<links.length; i++) {
		var link = links[i];
		$("#salssaNavbar > ul.navbar-nav").append('<li><a class="' + link.cssClass + '" href="#">' + link.name + '<span class="sr-only">(current)</span></a></li>');
		$('.'+link.cssClass).attr('href', link.url);
		$("."+link.cssClass).html(link.name  + '<span class="sr-only">(current)</span>');
	}
	
	// if userContext and authManager arguments are set, draw and handle user names and Logout link
	if(userContext != null && authManager != null) {
		
		var userInfoHtml =  '<ul class="nav navbar-nav navbar-right">' + 
						  	  	'<li><a id="userNames" href="#"></a></li>' + 
						        '<li><a id="logout_link" href="#">' + localize("Logout") + '</a></li>' + 
						     '</ul>';
		$("#salssaNavbar").append(userInfoHtml);
		var user = userContext['firstname'] + " " + userContext['lastname']; // set user name
		$("#userNames").text(user);	
		$("#logout_link").click(function() { // attach logout handler
			authManager.logout();
		});
		$("#userNames").click(function() { // attach logout handler
			window.location.href = APP_BASE_URL + "/user";
		});
		
		// is logged in user is admin, draw the User Management link
		if(userContext['isAdmin']) {
			var html =  '<li><a class="usr-mng-link" href="#">' + localize("User Management") + '</a></li>';
			$("#homePageRef").parent().after(html);
			$(".usr-mng-link").on('click' , function() { // attach user management handler
				window.location.href = APP_BASE_URL + "/users";
			});
		}
	}
	
	// set the active navbar link
	if(activeLink != null) {
		$("li > a" + activeLink).parent().addClass("active");
	}
}
