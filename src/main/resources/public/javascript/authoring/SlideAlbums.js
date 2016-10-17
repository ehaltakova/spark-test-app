/**
 * Slide Albums Manager. Handles CRUD of slide albums. Calls the Slide Albums
 * REST API. Keep an instance of the UI object representing the slide albums
 * list and calls its methods as REST WS callbacks.
 * 
 * NOTE: a slide album is uniquely identified by a title and customer!
 */
SlideAlbumsManager = function() {
	this.restApiUtil = new RESTAPIUtil();
	this.slideAlbumsList = new SlideAlbumsList(this);
};

/**
 * Call Get Slide Album WS
 */
SlideAlbumsManager.prototype.getSlideAlbums = function() {
	var url = "http://localhost:6789/spark/api/slidealbums";
	var type = 'POST';
	var data = {}; // request data
	var callback = (function(response) {
		return this.slideAlbumsList.displaySlideAlbums(response);
	}).bind(this);
	this.restApiUtil.execute(url, type, data, callback, false);
};

/**
 * Call Create Slide Album WS.
 * 
 * @param slideAlbum object The data of the slide album to be created
 */
SlideAlbumsManager.prototype.createSlideAlbum = function(slideAlbum) {
	var url = API_BASE_URL + '/api/createSlideAlbum';
	var type = 'POST';
	var data = slideAlbum; // request data
	var callback = (function(response) {
		return this.slideAlbumsList.addSlideAlbum(response);
	}).bind(this);
	this.restApiUtil.execute(url, type, data, callback, false);
};

/**
 * Call Edit Slide Album WS.
 * 
 * @param slideAlbum object The updated slide album data to be saved
 */
SlideAlbumsManager.prototype.editSlideAlbum = function(slideAlbum) {
	var url = API_BASE_URL + '/api/editSlideAlbum';
	var type = 'POST';
	var data = slideAlbum; // request data
	var callback = (function(response) {
		return this.slideAlbumsList.updateSlideAlbum(response);
	}).bind(this);
	this.restApiUtil.execute(url, type, data, callback, false);
};

/**
 * Call Delete Slide Album WS
 * 
 * @param title string The title of the slide album to be deleted
 * @param customer string The name of the slide album customer
 */
SlideAlbumsManager.prototype.deleteSlideAlbum = function(title, customer) {
	var url = "http://localhost:6789/spark/api/slidealbums/delete";
	var type = 'POST';
	var data = {
		'title' : title,
		'customer' : customer
	}; // request data
	var callback = (function(response) {
		return this.slideAlbumsList.removeSlideAlbum(title, customer);
	}).bind(this);
	this.restApiUtil.execute(url, type, data, callback, false);
};

/**
 * Slide Albums UI List. Represents a table with slide albums. Provides UI for
 * slide album CRUD operations.
 */
SlideAlbumsList = function(slideAlbumsMgr) {
	this.slideAlbumsMgr = slideAlbumsMgr;
	this.createSlideAlbumDialog = new CreateSlideAlbumDialog(this.slideAlbumsMgr);
	this.editSlideAlbumDialog = new EditSlideAlbumDialog(this.slideAlbumsMgr);
	this.slideAlbumsFilter = new SlideAlbumsFilter();
};

/**
 * Get Slide Album WS callback - display the slide albums being retrieved by the
 * REST API.
 */
SlideAlbumsList.prototype.displaySlideAlbums = function(resp) {

	this.slideAlbumsFilter.initialize(); // filter should be initialized before the table because of custom filter state saving for the table!

	// HOW THE CUSTOM FILTER IS APPLIED AND PRESERVED
	// 1. Filter drop down is intialized from the
	// 2. table is initialized, state is retrieved: if there are customers saved
	// in the state the filter is pre-selected with them;
	// otherwise the user's customers are used
	// 3. table is redrawn so the filter to be applied

	var self = this;

	// populate slide albums table
	var slideAlbums = resp;
	var slideAlbumsObjects = [];
	for (var i = 0; i < slideAlbums.length; i++) {
		if (slideAlbums[i]['svg'] != null) {
			var slideAlbumObj = buildRowData(slideAlbums[i]);
			slideAlbumsObjects.push(slideAlbumObj);
		}
	}
	var table = $('#slideAlbumsTable').DataTable({
		aaSorting : [],
		data : slideAlbumsObjects,
			'stateSave' : true,
			'stateDuration' : config['preserve_home_page_filters_state'],
			'aLengthMenu' : [ 5, 10, 20, 50 ],
			"aoColumns" : [ 
				{"mData" : "title"}, 
				{"mData" : "files"}, 
				{"mData" : "customer"},
				{"mData" : "modificationDate", "iDataSort" : 7},
				{"mData" : "content"}, 
				{"mData" : "edit" }, 
				{"mData" : "delete"}, 
				{"mData" : "modificationDateTime"}, 
				{"mData" : 'titleStr'} 
			],
			"aoColumnDefs" : [ 
				{
					"width" : "7%",
					"targets" : 4,
					"sortable" : false,
					"searchable" : false
				}, 
				{
					"width" : "7%",
					"targets" : 5,
					"sortable" : false,
					"searchable" : false
				}, 
				{
					"width" : "7%",
					"targets" : 6,
					"sortable" : false,
					"searchable" : false
				}, 
				{
					"width" : "20%",
					"targets" : 1
				}, 
				{
					"targets" : 7,
					"visible" : false
				}, 
				{
					"targets" : 8,
					"visible" : false
				}
			],
			"aaSorting" : [ [ 3, "desc" ] ],
			"stateSaveParams" : function(oSettings, sValue) { // save selected customers in the jquery datatables state!
				sValue['customers'] = $("#selectCustomer").val();
				return sValue;
			},
			"stateLoadParams" : function(oSettings, oData) { // load selected customers from the jquery datatables state and pre-select the filter drop-down																			
				$("#selectCustomer").val(oData['customers']);
				$("#selectCustomer").multiselect("refresh");
					var table = $('#slideAlbumsTable').DataTable();
					table.draw();
					return true;
				},
				"language" : {
					"decimal" : "",
					"emptyTable" : localize("No data available in table"),
					"info" : localize("Showing _START_ to _END_ of _TOTAL_ entries"),
					"infoEmpty" : localize("Showing 0 to 0 of 0 entries"),
					"infoFiltered" : localize("(filtered from _MAX_ total entries)"),
					"infoPostFix" : "",
					"thousands" : ",",
					"lengthMenu" : localize("Show _MENU_ entries"),
					"loadingRecords" : localize("Loading..."),
					"processing" : localize("Processing..."),
					"search" : localize("Search:"),
					"zeroRecords" : localize("No matching records found"),
					"paginate" : {
						"first" : localize("First"),
						"last" : localize("Last"),
						"next" : localize("Next"),
						"previous" : localize("Previous")
					},
					"aria" : {
						"sortAscending" : localize(": activate to sort column ascending"),
						"sortDescending" : localize(": activate to sort column descending")
					}
				}
			});

	var table = $('#slideAlbumsTable').DataTable();

	// customers filter applied to table rows
	$.fn['dataTable'].ext.search.push(function(settings, data, dataIndex) {
		var selectedCustomesList = $("#selectCustomer").val();
		var customer = data[2];
		if ($.inArray(customer, selectedCustomesList) > -1) {
			return true;
		} else {
			return false;
		}
	});

	// delete button click handler
	$('#slideAlbumsTable tbody').on('click', '.delete-slide-album', (function(e) {
		var rowToDelete = e.target; // NOTE target might be the the link element <a> or the inner <span> element hodling the button icon (depending on the exact mouse position)
		var title = rowToDelete.nodeName.toLowerCase() != "a" ? $(rowToDelete.parentNode).data("name") : $(rowToDelete).data("name");
		var customer = rowToDelete.nodeName.toLowerCase() != "a" ? $(rowToDelete.parentNode).data("customer") : $(rowToDelete).data("customer");
		bootbox.confirm({
			'message' : localize("This will delete all of the files in the slide album.\n Are you sure you want to complete this action?"),
			'buttons' : {
				'confirm' : {
					'label' : localize('OK')
				},
				'cancel' : {
					'label' : localize('Cancel')
				}
			},
			'callback' : (function(result) {
				if (result) {
					this.slideAlbumsMgr.deleteSlideAlbum(title, customer);
				}}).bind(this)
			}).bind(this);
		}).bind(this));

	// edit button click handler
	$('#slideAlbumsTable tbody').on('click', '.edit-slide-album', function() {
		// show the Edit Slide Album Dialog
		self.editSlideAlbumDialog.show(this);
	});

	$('#slideAlbumsCount').html("You have " + slideAlbumsObjects.length + " slide albums in your workspace");

	// Note: initialize create/edit dialogs and the filter component here,
	// when the slide albums list is already initialized and attached to the DOM
	this.createSlideAlbumDialog.initialize();
	this.editSlideAlbumDialog.initialize();

	// at the end re-draw the table when the customes pre-selected are loaded
	var table = $('#slideAlbumsTable').DataTable();
	table.draw(false);
};

/**
 * Create Slide Album WS callback - add the created slide album row to the table.
 */
SlideAlbumsList.prototype.addSlideAlbum = function(response) {
	// add row to the table and update the slide albums counter
	var slideAlbum = response;
	var table = $('#slideAlbumsTable').DataTable();
	var newSlideAlbumRowData = buildRowData(slideAlbum);
	table.row.add(newSlideAlbumRowData);
	$("#slideAlbumsTable").dataTable().fnSort([ [ 3, "desc" ] ]);
	var countNr = table.data().length;
	$('#slideAlbumsCount').html("You have " + countNr + " slide albums in your workspace");

	// apply table filter
	if ($.inArray(slideAlbum['customer'], $("#selectCustomer").val()) == -1) {
		// this.slideAlbumsFilter.filterList(slideAlbum.customer, false);
	}
};

/**
 * Edit Slide Album WS callback - update the corresponding slide album row.
 */
SlideAlbumsList.prototype.updateSlideAlbum = function(response) {

	// find current row being edited
	var targetElement = null;
	$('.edit-slide-album').each(function() {
		if ($(this).data("name") == response['slideAlbum']['oldTitle'] && $(this).data("customer") == response['slideAlbum']['customer']) {
				targetElement = this;
		}
	});

	// update the corresponding row
	var table = $('#slideAlbumsTable').DataTable();
	var rowToUpdate = targetElement.parentNode.parentNode;
	var updatedRowData = buildRowData(response['slideAlbum']);
	table.row(rowToUpdate).data(updatedRowData);
	$("#slideAlbumsTable").dataTable().fnSort([ [ 3, "desc" ] ]);

	// notify user for the successful completion of the operation
	displayUserNotification('success', [ localize('Slide Album was successfully updated.') ]);
};

/**
 * Delete Slide Album WS callback - removes the corresponding slide album row
 * from the table.
 */
SlideAlbumsList.prototype.removeSlideAlbum = function(title, customer) {

	var targetElement = null; // find current row to be deleted
	$('.delete-slide-album').each(function() {
		if ($(this).data("name") == title && $(this).data("customer") == customer) {
			targetElement = this;
		}
	});

	// remove the row, update table and counter
	var rowToDelete = targetElement.parentNode.parentNode;
	var table = $('#slideAlbumsTable').DataTable();
	table.row(rowToDelete).remove().draw();
	var countNumber = table.data().length;
	$('#slideAlbumsCount').html("You have " + countNumber + " slide albums in your workspace");
};

/**
 * Create Slide Album Dialog.
 */

CreateSlideAlbumDialog = function(slideAlbumsMgr) {
	this.slideAlbumsMgr = slideAlbumsMgr;
};

/**
 * Set up "Create Slide Album" dialog
 */
CreateSlideAlbumDialog.prototype.initialize = function() {

	// set up dialog
	this.attachFileUploader();
	
	// bind click event
	var createSADialog = this;
	$("#createBtn").off('click').on('click', function(e) {
		createSADialog.submitForm(e, null);
	});
	// clear on hide
	$('body').on('hidden.bs.modal', '#createSADialog', function() { // clear form on dialog hide
		createSADialog.clear(this);
	});
	// prevent submitting with enter
	$('#createSAForm').on('keyup keypress', function(e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	});
};

/**
 * Clear "Create Slide Album" form
 */
CreateSlideAlbumDialog.prototype.clear = function(dialog) {
	$("#formErrors").html(""); // clear errors area
	$('#createSAForm').get(0).reset(); // reset the form
	$("#fileupload").val("");
	$(dialog).data('bs.modal', null);
	$(dialog).removeData('bs.modal');
};

/**
 * Attach file upload handler for the "Create Slide Album" form
 */
CreateSlideAlbumDialog.prototype.attachFileUploader = function() {
	var createSADialog = this;
	$(function() {
		$('#fileupload').fileupload({
			'replaceFileInput' : false,
			'maxFileSize' : 20000000, // 20MB
			'acceptFileTypes' : /(\.|\/)(svg)$/i,
			'url' : 'http://localhost:6789/spark/api/slidealbums/create',
			'add' : function(e, data) {
				var lastSelectedFile = data.files[data.files.length - 1].name;
				$("#selectedFileName").val(lastSelectedFile);
				data.context = $('#createBtn').off('click').on('click', function() {
					createSADialog.submitForm(e, data);
				});
			},
			'done' : function(e, data) {
				var responseBody = data.result;
				createSADialog.slideAlbumsMgr.slideAlbumsList.addSlideAlbum(responseBody);
			},
			'error' : function(e, data) {
				displayUserNotification('danger', [ localize('Error occured during file upload. Slide album could not be created.') ]);
			}
		});
	});
};

/**
 * Validate "Create Slide Album" form
 */
CreateSlideAlbumDialog.prototype.validateForm = function() {

	var errorMessages = [];
	var title = $("#title").val().trim();
	var filename = $("#selectedFileName").val(); // this will be set if file
													// was uploaded with the
													// file uploader
	var fileInputValue = $("#fileupload").val();
	var customer = $("#customerSelect").val();

	// check for title
	if (title == null || title == "") {
		errorMessages.push(localize("Title is required.") + " \n");
	}

	// check for file
	if (filename == null || (fileInputValue == null || fileInputValue == "")) {
		errorMessages.push(localize("SVG file is required.") + " \n");
	} else {
		// check for fileType
		var fileType = filename.split('.').pop();
		var allowedtypes = 'svg';
		var isValidType = true;
		if (allowedtypes.indexOf(fileType) < 0) {
			errorMessages.push(localize("Incorrect file type. Allowed file type is .svg."));
		}
	}
	// check for duplicate titles for the same customer
	if (title != null && title != "") {
		var table = $("#slideAlbumsTable").DataTable();
		var hasDuplicates = false;
		table.rows().nodes().each(function(idx, tr) {
			var rowData = table.row(idx).data();
			if (rowData['titleStr'].toLowerCase() == title.toLowerCase() && rowData['customer'] == customer) { // check case insensitive!
				hasDuplicates = true;
			}
		});
		if (hasDuplicates) {
			errorMessages.push(localize("Duplicate slide album title. Please, select different title."));
		}
	}
	return errorMessages;
};

/**
 * Submit "Create Slide Album" form - call Create Slide Album REST WS
 */
CreateSlideAlbumDialog.prototype.submitForm = function(e, data) {
	var createSADialog = this;
	e.preventDefault(); // prevent form submit
	var validationMessages = createSADialog.validateForm();
	if (validationMessages.length > 0) {
		displayNotification('danger', validationMessages, '#formErrors', false); // display errors if validation fails
	} else {
		data.submit();
		$('#createSADialog').modal('hide');
	}
	return false;
};

/**
 * Edit Slide Album Dialog
 */

EditSlideAlbumDialog = function(slideAlbumsMgr) {
	this.slideAlbumsMgr = slideAlbumsMgr;
};

/**
 * Prepare "Edit Slide Album" dialog.
 */
EditSlideAlbumDialog.prototype.initialize = function() {
	this.attachEditFileUploader();
	$("#editBtn").off('click').on('click', function() {
		$("#editSAForm").submit(); // submit create form on Create btn click
	});
	$("#editSAForm").off('submit').on("submit", (function(e) {
		this.submitForm(e);
	}).bind(this));
	var editSADialog = this;
	$('body').on('hidden.bs.modal', '#editSADialog', function() { // clear form on dialog hide
		editSADialog.clear(this);
	});

	// prevent submitting with enter
	$('#editSAForm').on('keyup keypress', function(e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	});
};

/**
 * Clear "Edit Slide Album" form
 */
EditSlideAlbumDialog.prototype.clear = function(dialog) {
	$("#editFormErrors").html("");
	$('#editSAForm').get(0).reset();
	$(dialog).data('bs.modal', null);
	$(dialog).removeData('bs.modal');
};

/**
 * Attach file upload handler for the "Edit Slide Album" form
 */
EditSlideAlbumDialog.prototype.attachEditFileUploader = function() {

	// do the trick with the link acting as file input - this don't work in IE 9
	// :<
	// $(function(){
	// $("#uploadLink").off('click').on('click', function(e){
	// e.preventDefault();
	// $("#editFileupload").trigger('click');
	// });
	// });

	// attach file upload handler for the Edit SA form
	$(function() {
		$('#editFileupload').fileupload({
			'replaceFileInput' : false,
			'maxFileSize' : 2000000, // 2MB
			'acceptFileTypes' : /(\.|\/)(svg)$/i,
			'url' : config['api_base_url'] + '/src/upload/',
			'dataType' : 'json',
			'add' : function(e, data) {
				data.context = $('#editBtn').off('click').on('click', function() { // upload the file on Create button click
					data.submit(); // upload the file without submitting the form
					return false;
				});
			},
			'change' : function(e, data) {
				var file = data.files[data.files.length - 1].name;
				$("#hasFileContentChange").val("1"); // set hasFileContentChange hidden value to 1
				$("#uploadLink").html(file);
				$("#editFilename").val(file.split(".svg")[0]);
			},
			'done' : function(e, data) {
				var lastSelectedFile = data.files[data.files.length - 1].name;
				$('#editSelectedFileName').val(lastSelectedFile);
				$("#editSAForm").submit(); // if upload is successful submit the form
			},
			'error' : function(e, data) {
				displayNotification('danger', [ localize('Error occured during file upload. Slide album file was not updated.') ], "#editFormErrors", false);
			}
		});
	});
};

/**
 * Validate "Edit Slide Album" form
 */
EditSlideAlbumDialog.prototype.validateForm = function() {

	var errorMessages = {
		'type' : 'danger',
		'messages' : []
	};
	var title = $("#editTitle").val().trim();
	var filename = $("#editFilename").val().trim();
	var file = $("#editSelectedFileName").val(); // this will be set if file was uploaded with the file uploader
	var fileInputValue = $("#editFileupload").val();
	var oldTitle = $("#oldTitle").val();
	var oldFilename = $("#oldFilename").val();
	var hasFileContentChange = $("#hasFileContentChange").val();
	var customer = $("#customer").val();

	// check if there are changes
	if (title == oldTitle && filename == oldFilename && hasFileContentChange == 0) {
		errorMessages['type'] = 'warning';
		errorMessages['messages'].push(localize("There are no changes to save.") + " \n");
		return errorMessages;
	}

	// check for title
	if (title == null || title == "") {
		errorMessages['messages'].push(localize("Title cannot be empty.") + " \n");
	} else {
		// check for not allowed characters
		// if(/^[a-zA-Z0-9-()_ ]*$/.test(title) == false) {
		// errorMessages['messages'].push(localize('Title contains invalid
		// characters. Allowed are letters, digits and the following symbols:
		// "(", "), "_", "-".'));
		// }
	}

	// check for fileType
	var fileType = file.split('.').pop();
	var allowedtypes = 'svg';
	var isValidType = true;
	if (allowedtypes.indexOf(fileType) < 0) {
		errorMessages['messages'].push(localize("Incorrect file type. Allowed file type is .svg."));
	}

	// check for filename
	if (filename == null || filename == "") {
		errorMessages['messages'].push(localize("Filename cannot be empty.") + " \n");
	} else {
		// check for not allowed characters
		// if(/^[a-zA-Z0-9-()_ ]*$/.test(filename) == false) {
		// errorMessages['messages'].push(localize('File name contains invalid
		// characters. Allowed are letters, digits and the following symbols:
		// "(", "), "_", "-".'));
		// }
	}
	// check for duplicate titles for the same customer if the title was changed
	if (title != oldTitle) {
		if (title != null && title != "") {
			var table = $("#slideAlbumsTable").DataTable();
			var hasDuplicates = false;
			table.rows().nodes().each(function(idx, tr) {
				var rowData = table.row(idx).data();
				if (rowData['titleStr'].toLowerCase() == title.toLowerCase() && rowData['customer'] == customer && oldTitle.toLowerCase() != title.toLowerCase()) { // check case insensitive!
					hasDuplicates = true;
				}
			});
			if (hasDuplicates) {
				errorMessages['messages'].push(localize("Duplicate slide album title. Please, select different title."));
			}
		}
	}
	return errorMessages;
};

/**
 * Submit "Edit Slide Album" form - call Edit Slide Album WS
 */
EditSlideAlbumDialog.prototype.submitForm = function(e) {
	e.preventDefault(); // prevent form submit
	var errorMessages = this.validateForm(); // validate form
	if (errorMessages['messages'].length > 0) {
		displayNotification(errorMessages['type'], errorMessages['messages'], '#editFormErrors', false);
		return false;
	} else {
		var title = $("#editTitle").val().trim();
		var filename = $("#editFilename").val().trim();
		var file = $("#editSelectedFileName").val(); // this will be set if file was uploaded with the file uploader
		var fileInputValue = $("#editFileupload").val();
		var oldTitle = $("#oldTitle").val();
		var oldFilename = $("#oldFilename").val();
		var hasFileContentChange = $("#hasFileContentChange").val();
		var customer = $("#customer").val();
		var slideAlbum = {
			'title' : oldTitle,
			'newTitle' : title == oldTitle ? null : title,
			'fileName' : filename == oldFilename ? null : filename,
			'file' : hasFileContentChange == '0' ? null : file,
			"customer" : customer
		}
		this.slideAlbumsMgr.editSlideAlbum(slideAlbum);
		$('#editSADialog').modal('hide')
		return false;
	}
};

/**
 * Pre-select the dialog with the data of the slide album to be edited and show
 * it
 */
EditSlideAlbumDialog.prototype.show = function(editButtonElement) {

	// var selectedCustomersList = $('#selectCustomer').val();
	// console.log(selectedCustomersList);
	// var table = $('#slideAlbumsTable').DataTable();
	// var nrItemsPerPage = table.page.len();
	// console.log(nrItemsPerPage);
	// var sortingColumnIndex = table.order()[0][0];
	// var order = table.order()[0][1];
	// console.log("column index: " + sortingColumnIndex + " in " + order + "
	// order");

	// $("#selectCustomer").val(["Honda"]);
	// $("#selectCustomer").multiselect("refresh");

	// pre-select "Edit Slide Album" dialog input values
	$('#editTitle').val($(editButtonElement).data("name"));
	var fileNameToEdit = null;
	$(editButtonElement).parent().siblings("td").find("img").each(function() {
		if ($(this).data("filename") != null) {
			fileNameToEdit = $(this).data("filename");
		}
	});
	$('#editFilename').val(fileNameToEdit);
	$("#uploadLink").html(fileNameToEdit + ".svg");

	// fill in hidden fields with the initial values
	$("#oldTitle").val($(editButtonElement).data("name"));
	$("#oldFilename").val(fileNameToEdit);
	$("#hasFileContentChange").val("0");
	$("#customer").val($(editButtonElement).data("customer"));

	// show the dialog
	$('#editSADialog').modal('show');
};

/**
 * Slide Albums Customers Filter. UI component providing the ability to filter
 * the table by one or by mutliple customers.
 */

SlideAlbumsFilter = function() {
	this.rows = [];
};

/**
 * Set up the slide albums customers filter component and add it to the page
 */
SlideAlbumsFilter.prototype.initialize = function() {

	var slideAlbumsFilter = this;
	$('#selectCustomer').multiselect({
		'nonSelectedText' : localize('Select Customer'),
		'includeSelectAllOption' : true,
		'selectAllValue' : 'select-all-value',
		'selectAllNumber' : true,
		'nSelectedText' : localize("selected"),
		'allSelectedText' : localize('All Customers'),
		'selectAllText' : localize('Select All'),
		'onChange' : function(option, checked, select) {
			var table = $('#slideAlbumsTable').DataTable();
			table.draw();
			// slideAlbumsFilter.filterList($(option).val(), checked);
		},
		'buttonClass' : 'btn btn-warning',
		'selectedClass' : 'btn-default'
	});
};

/**
 * Show/Hide slide albums for the specified customer Note: not used
 */
SlideAlbumsFilter.prototype.filterList = function(customerName, checked) {

	var slideAlbumsFilter = this;

	// select/deselect Select All option
	var table = $('#slideAlbumsTable').DataTable();
	if (customerName == null) { // select all option
		if (checked) {
			for ( var customer in slideAlbumsFilter.rows) {
				for (var j = 0; j < slideAlbumsFilter.rows[customer].length; j++) {
					table.row.add(slideAlbumsFilter.rows[customer][j]);
				}
			}
			$("#slideAlbumsTable").dataTable().fnSort([ [ 3, "desc" ] ]);
			rows = [];
		} else {
			var rowsToDelete = [];
			table.rows().every(function(rowIdx, tableLoop, rowLoop) {
				var d = this.data();
				rowsToDelete.push(this.node());
				if (slideAlbumsFilter.rows[d.customer] == null) {
					slideAlbumsFilter.rows[d.customer] = [];
				}
				slideAlbumsFilter.rows[d.customer].push(d);
			});
			for (var i = 0; i < rowsToDelete.length; i++) {
				table.row(rowsToDelete[i]).remove().draw();
			}
		}
		return;
	}

	var selectedCustomers = $('#selectCustomer').val();
	if (checked) {
		var rowsToDelete = [];
		// add current selected customer rows if they were hidden
		if (slideAlbumsFilter.rows[customerName] != null
				&& slideAlbumsFilter.rows[customerName].length > 0) {
			for (var i = 0; i < slideAlbumsFilter.rows[customerName].length; i++) {
				table.row.add(slideAlbumsFilter.rows[customerName][i]);
			}
			$("#slideAlbumsTable").dataTable().fnSort([ [ 3, "desc" ] ]);
			slideAlbumsFilter.rows[customerName] = [];
		} else {
			// remove other customers rows if they are not selected
			table.rows().every(function(rowIdx, tableLoop, rowLoop) {
				var d = this.data();
				if (d.customer != customerName
						&& $.inArray(d.customer,
								selectedCustomers) == -1) {
					rowsToDelete.push(this.node());
					if (slideAlbumsFilter.rows[d.customer] == null) {
						slideAlbumsFilter.rows[d.customer] = [];
					}
					slideAlbumsFilter.rows[d.customer].push(d);
				}
			});
			for (var i = 0; i < rowsToDelete.length; i++) {
				table.row(rowsToDelete[i]).remove().draw();
			}
		}
	} else {
		// hide deselected customer rows
		rowsToDelete = [];
		table.rows().every(function(rowIdx, tableLoop, rowLoop) {
			var d = this.data();
			if (d.customer == customerName) {
				rowsToDelete.push(this.node());
				if (slideAlbumsFilter.rows[d.customer] == null) {
					slideAlbumsFilter.rows[d.customer] = [];
				}
				slideAlbumsFilter.rows[d.customer].push(d);
			}
		});
		for (var i = 0; i < rowsToDelete.length; i++) {
			table.row(rowsToDelete[i]).remove().draw();
		}
	}
};

/** **************************** Helper Methods***************************** */

function buildFilesColumn(files, filePath) {
	var filesCol = '<div>';
	var svg = null;
	var svgIndex = -1;
	var json = null;
	var jsonIndex = -1;
	var animationFiles = [];
	// find the svg and the json file (if any) and store them and their indexes
	for (var i = 0; i < files.length; i++) {
		if (files[i]['ext'] == "svg") {
			svg = files[i];
			svgIndex = i;
		} else if (files[i]['ext'] == "json") {
			json = files[i];
			jsonIndex = i;
		} else {
			animationFiles.push(files[i]);
		}
	}
	if (svg == null) {
		return null;
	}

	// add the svg first
	filesCol += '<a href="' + filePath + svg['name'] + "." + svg['ext']
			+ '"> <img title="' + svg['name'] + "." + svg['ext']
			+ '" class="file-type-icon" data-filename="' + svg['name']
			+ '" src="images/' + svg['ext'] + '.png" /> </a>';
	// add the animationfiles
	for (var j = 0; j < animationFiles.length; j++) {
		var pathToFile = filePath + animationFiles[j]['name'] + "."
				+ animationFiles[j]['ext'];
		filesCol += '<a href="' + pathToFile + '"> <img title ="'
				+ animationFiles[j]['name'] + "." + animationFiles[j]['ext']
				+ '" class="file-type-icon" src="images/'
				+ animationFiles[j]['ext'] + '.png" /></a>';
	}
	// add the json file at the end if exists
	if (json != null) {
		filesCol += '<a href="' + filePath + json['name'] + "." + json['ext']
				+ '"> <img title="' + json['name'] + "." + json['ext']
				+ '" class="file-type-icon" src="images/' + json['ext']
				+ '.png" /> </a>';
	}
	filesCol += '</div>';
	return filesCol;
}

function buildRowData(slideAlbum) {

	var lock = slideAlbum['locked'];
	var lockedIcon = "";
	if (lock != null) {
		if (lock == sessionMgr.getUserContext()['username']) {
			lockedIcon = '<span title="' + localize("Locked by me") + '" class="glyphicon glyphicon-lock"></span> '; // locked by same user
		} else {
			lockedIcon = '<span title="' + localize("Locked by {_username}", { _username : slideAlbum['locked'] }) + '" class="glyphicon glyphicon-user"></span> '; // locked by other user
		}
	}
	var viewURL = APP_BASE_URL + '/slidealbum?'
			+ encodeURIComponent('title=' + slideAlbum['title'] + '&customer='
					+ slideAlbum['customer'] + '&readOnly=true');
	var openURL = APP_BASE_URL
			+ '/slidealbum?'
			+ encodeURIComponent('title=' + slideAlbum['title'] + '&customer='
					+ slideAlbum['customer'] + '&readOnly=false');
	var viewIcon = '<a href="' + viewURL + '" title="'
			+ localize("View slide album in read-only mode")
			+ '" class="view-slide-album" data-name="' + slideAlbum['title']
			+ '" data-customer="' + slideAlbum['customer']
			+ '"> <span class="glyphicon glyphicon-eye-open"></span> </a>';
	var titleCol = '<div class="slide-album-title">' + lockedIcon
			+ slideAlbum['title'] + '  ' + viewIcon + '</div>';
	var contentCol = '<a href="' + openURL + '" title="'
			+ localize("Open to edit content")
			+ '" class="open-slide-album btn btn-warning btn-sm" data-name="'
			+ slideAlbum['title'] + '" data-customer="'
			+ slideAlbum['customer']
			+ '"> <span class="glyphicon glyphicon-cog"></span> </a>';
	var editCol = '<a href="#" title="' + localize("Edit slide album")
			+ '" class="edit-slide-album btn btn-danger btn-sm"" data-name="'
			+ slideAlbum['title'] + '" data-customer="'
			+ slideAlbum['customer']
			+ '"> <span class="glyphicon glyphicon-edit"></span> </a>';
	var deleteCol = '<a href="#"  title="' + localize("Delete slide album")
			+ '" class="delete-slide-album btn btn-primary btn-sm" data-name="'
			+ slideAlbum['title'] + '" data-customer="'
			+ slideAlbum['customer']
			+ '"> <span class="glyphicon glyphicon-trash"></span> </a>';
	var date = formatDate(new Date(slideAlbum['modificationDate'] * 1000));
	var customerCol = slideAlbum['customer'];
	var filePath = config['workspace_folder_path'] + "/"
			+ slideAlbum['customer'] + "/" + slideAlbum['title'] + "/";
	var filesCol = buildFilesColumn(slideAlbum['files'], filePath);
	var rowData = {
		'title' : titleCol,
		'files' : filesCol,
		'customer' : customerCol,
		'modificationDate' : date,
		'content' : contentCol,
		'edit' : editCol,
		'delete' : deleteCol,
		'modificationDateTime' : slideAlbum['modificationDate'],
		'titleStr' : slideAlbum['title']
	};
	return rowData;
}

function formatDate(date) {
	// var formattedDate = date.toLocaleDateString(config['locale'], {day:
	// 'numeric', month : "short", year: 'numeric'});
	var monthNames = [ "January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December" ];
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();

	return day + ' ' + monthNames[monthIndex] + ' ' + year;
	return formattedDate;
}