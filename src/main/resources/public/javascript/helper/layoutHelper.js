/**
 * Layout helper functions.
 */

/**
 * Display notification messages to the user in the user notifications area.
 * @param type string (info | success | warning | danger) Message style
 * @param messages array Messages to be displaied
 */
function displayUserNotification(type, messages) {
	var html = '<div class="alert alert-'+ type + ' alert-dismissable">' +
 					'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">' + 
 						'&times;' + 
 					'</button>';
	for(var i=0; i<messages.length; i++) {
		html += "<div>"+messages[i]+'</div>';
	}
	html += '</div>';
	$("#notificationsArea").html(html);
	$('html, body').animate({
		scrollTop: $("#notificationsArea").offset().top - 75 // scroll to the notifications area where the error appears (75 is because of the fixed navbar)
	}, 500);
}

/**
 * Display notification messages to the user at a specified place matching the specified selector.
 * @param type string (info | success | warning | danger) Messages style
 * @param messages array Messages to be displayed
 * @param selector string The UI selector of the container element where the messages should be shown
 * @param insertBefore boolean If set to true user notification messages should be inserted before the element matching the specified selector
 */
function displayNotification(type, messages, selector, insertBefore) {
	var html = '<div class="alert alert-'+ type + ' alert-dismissable">' +
 					'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">' + 
 						'&times;' + 
 					'</button>';
	for(var i=0; i<messages.length; i++) {
		html += "<div>"+messages[i]+'</div>';
	}
	html += '</div>';
	if(insertBefore) {
		$(selector).before(html);
	} else {
		$(selector).html(html);
	}
}

/**
 * Create dynamic table with custom options and add it to the DOM. DataTables Jquery plugin is used.
 * @param selector The id of the container element to hold the table
 * @param columns Array with columns titles of the following types:
 * - [ {'<title1>' : '<name-of-the-column1>'}, {'<title2>' : '<name-of-the-column2>', etc,]
 * - [ {data: '<key1>'}, {data: <'key2'>}, etc. ] - if data is an array of objects
 * @param data Array with table rows data.
 * Each data item could be:
 * - array with string values ['<val1>', '<val2>', etc.] or
 * - array of JS objects [ {'<key1>: '<val1>', '<key2>: '<val2>', etc}, {'<key3>: '<val3>', '<key4>: '<val4>'}, etc.]
 * @param pagerMenuOptions One dimensional array defining menu options values or two dimensional array defining menu options values and labels
 */
function drawTable(selector, columns, data, pagerMenuOptions) {
	var html = '<table id="slideAlbumsList" cellspacing="0" width="100%">'; // basic table html
	html += '<thead> <tr></tr> </thead>';
	html += '</table>';
	$(selector).after(html); // add table to the page
	$('#slideAlbumsList').DataTable( { // populate table with passed data
	    data: data,
	    columns: columns,
	    'aLengthMenu': pagerMenuOptions
	});
}
	
/**
 * Create dynamic table with custom options and add it to the DOM. DataTables Jquery plugin is used.
 * @param selector The id of the container element to hold the table
 * @param columns Array with columns titles of the following types:
 * - [ {'<title1>' : '<name-of-the-column1>'}, {'<title2>' : '<name-of-the-column2>', etc,]
 * - [ {data: '<key1>'}, {data: <'key2'>}, etc. ] - if data is an array of objects
 * @param data Array with table rows data.
 * Each data item could be:
 * - array with string values ['<val1>', '<val2>', etc.] or
 * - array of JS objects [ {'<key1>: '<val1>', '<key2>: '<val2>', etc}, {'<key3>: '<val3>', '<key4>: '<val4>'}, etc.]
 * @param customOptions Array with custom options to be set the table. Each item should be a key-value pair which are valid options in the terms of DataTables plugin.
 */
function drawCustomTable(selector, columns, data, customOptions) {
	var html = '<table id="slideAlbumsTable" cellspacing="0" width="100%">'; // basic table html
	html += '<thead> <tr></tr> </thead>';
	html += '</table>';
	$(selector).after(html); // add table to the page
	var dataTableSettings = {
		data: data,
		columns: columns
	};
	$('#slideAlbumsTable').DataTable(dataTableSettings); //populate table with passed data	
}