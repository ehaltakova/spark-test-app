/** Called when viewer.html page is loaded
*/
$( document ).ready(function() {
	
	// draw navbar
	drawNavbar(localize("AWD Viewer"), "./viewer.html", {}, '.home-page-link', null, null);
 
	if(typeof diagrams === 'undefined') {
		$.ajax({
			type: 'POST',
			contentType: "application/x-www-form-urlencoded",
			url: config['api_base_url'] + "/api/getViewerSlideAlbums",     
			async: true,
			data: {},
			success: function(resp) {
				var diagrams = resp;
				var html = '<div class="panel-group" id="accordion">';
				for(customer in diagrams) {
					var customerId = customer.replace(" ", "_");
					var hasLogoImg = diagrams[customer].logoImg;
					html += '<div class="panel panel-primary" style="margin-bottom:15px;">' +
								'<div class="panel-heading">' +
									'<h4 class="panel-title">' +
										'<a data-toggle="collapse" data-parent="#accordion" href="#' + customerId + '">' + customer + '</a>' +
									'</h4>' +
								'</div>'+
								'<div id="' + customerId + '" class="panel-collapse collapse">'+
									'<div class="panel-body row">' + 
										'<div class="col-md-8">';
											var wiringDiagrams = diagrams[customer].schematics;
											if(wiringDiagrams != null) {
												for(var i=0; i<wiringDiagrams.length; i++) {
													var wiringDiagram = wiringDiagrams[i];
													var nameToDisplay = Object.keys(wiringDiagram)[0];
													var svgFile = wiringDiagram[nameToDisplay];
													html += '<a href="#" class="list-group-item" data-svg="' + svgFile + '" data-customer="' + customer + '">' + nameToDisplay + '</a>';
												}		
											}	
					html += 			'</div>' +
										'<div class="col-md-4">' + (hasLogoImg != null ? (' <img class="customer-logo" src="../schematics/' + customer + '/'+ diagrams[customer].logoImg + '">') : '')  + '</div>' +
									'</div>' + 
								'</div>' +
							'</div>';
				}
				html += '</div>';
				$('#mainContainer').html(html);		
				
				var queryString = unescape(decodeURIComponent(window.location.search.substring(1)));
				var customer = getDecodedURLParam(queryString, 'customer');
				if(customer != null) {
					customer = customer.replace(" ", "_");
				}

				$("#" + customer).attr("class", "panel-collapse collapse in");
				
				$(".list-group-item").on("click", function() {
					var title = $(this).html();
					var svg = $(this).data("svg");
					var customer = $(this).data("customer");
					window.location.href = "./wirediagram.html?" + encodeURIComponent("title=" + title + "&customer=" + customer + "&fileName=" + svg);
				});
				
			},
			error: function(resp) {
				console.log(resp);
			},
			dataType: "json"               
		});
	} else {
		// read diagrams.js and populate list with wire diagrams
		if((!(diagrams === undefined)) && diagrams != null) {
			var html = '<div class="panel-group" id="accordion">';
			for(customer in diagrams) {
				var customerId = customer.replace(" ", "_");
				var hasLogoImg = diagrams[customer].logoImg;
				html += '<div class="panel panel-primary" style="margin-bottom:15px;">' +
							'<div class="panel-heading">' +
								'<h4 class="panel-title">' +
									'<a data-toggle="collapse" data-parent="#accordion" href="#' + customerId + '">' + customer + '</a>' +
								'</h4>' +
							'</div>'+
							'<div id="' + customerId + '" class="panel-collapse collapse">'+
								'<div class="panel-body row">' + 
									'<div class="col-md-8">';
										var wiringDiagrams = diagrams[customer].schematics;
										if(wiringDiagrams != null) {
											for(var i=0; i<wiringDiagrams.length; i++) {
												var wiringDiagram = wiringDiagrams[i];
												var nameToDisplay = wiringDiagram[Object.keys(wiringDiagram)[0]];
												var svgFile = 'schematics/' + customer + '/' + nameToDisplay + '/' +Object.keys(wiringDiagram)[0];
												html += '<a href="#" class="list-group-item" data-svg="' + svgFile + '" data-customer="' + customer + '">' + nameToDisplay + '</a>';
											}		
										}	
				html += 			'</div>' +
									'<div class="col-md-4">' + (hasLogoImg != null ? (' <img class="customer-logo" src="../schematics/' + customer + '/'+ diagrams[customer].logoImg + '">') : '')  + '</div>' +
								'</div>' + 
							'</div>' +
						'</div>';
			}
			html += '</div>';
			$('#mainContainer').html(html);			
		}
	}
	
	var queryString = unescape(decodeURIComponent(window.location.search.substring(1)));
	var customer = getDecodedURLParam(queryString, 'customer');
	if(customer != null) {
		customer = customer.replace(" ", "_");
	}
	$("#" + customer).attr("class", "panel-collapse collapse in");	
	
	$(".list-group-item").on("click", function() {
		var title = $(this).html();
		var svg = $(this).data("svg");
		var customer = $(this).data("customer");
		window.location.href = "./wirediagram.html?" + encodeURIComponent("title=" + title + "&customer=" + customer + "&fileName=" + svg);
	});
	

	
});

