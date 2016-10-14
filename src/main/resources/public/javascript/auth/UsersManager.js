/**
 * Users Management.
 * Handles CRUD of users.
 * Calls the User Management REST API.
 * Keep an instance of the UI object representing the users list and calls its methods as REST WS callbacks.
 */
	
	/**
	 * Users Manager Constructor.
	 */
	UsersManager = function () {
        this.usersList = new UsersList(this);
	};

	/**
	 * Users Manager Methods
	 */
    	
    	/**
    	 *  Retrieve users in the system.
    	 *  Call Get Users REST WS.
    	 */
        UsersManager.prototype.getUsers = function () {			
        	var usersList = this.usersList;	
        	var url = API_BASE_URL + '/api/admin/users/all';
           	var type = 'POST';	 
           	var data = { 'sessionToken': sessionMgr.getUserContext()['sessionToken'] };
           	var callback = function(response) { usersList.populateList(response); };
           	$.ajax({
    			type: type,
    			contentType: "application/x-www-form-urlencoded",
    			url: url,     
    			async: true,
    			data: JSON.stringify(data),
    			success: function(response) {
        			callback(response);
    			},
    			error: function(response) {
    				var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
    	        	displayUserNotification('danger', [errorMsg]);
    			},
    			dataType: "json"               
    		});
        };
        
        /**
    	 *  Create new user in the system.
    	 *  Call Create User REST WS.
    	 *  @param user object Data of the user to be created
    	 */
       UsersManager.prototype.createUser = function (user) {
    	   var usersList = this.usersList;	
    	   var url = API_BASE_URL + '/api/admin/users';
       	   var type = 'POST';	 
       	   var data = user;
       	   data['sessionToken'] = sessionMgr.getUserContext()['sessionToken'];
       	   var callback = function(response) {usersList.addUser(response); };
       	   $.ajax({
       		   type: type,
       		   contentType: "application/x-www-form-urlencoded",
       		   url: url,     
       		   async: true,
       		   data: JSON.stringify(data),
       		   success: function(response) {
       			   callback(response);
       		   },
       		   error: function(response) {
       			   var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
       			   if(response.status == 409) {
       				   var responseText = JSON.parse(response.responseText);
       				   errorMsg = response.status + " " + response.statusText + ": " + localize("Username {_username} is bisy. User cannot be created. Please, choose another username.", {_username:responseText['username']});
       			   }
       			  displayUserNotification('danger', [errorMsg]);
       		   },
       		   dataType: "json"               
       	   });
        };
    	
    	/**
    	 *  Edit user.
    	 *  Call Edit User REST WS.
    	 *  @param user object User data to be updated with
    	 */
        UsersManager.prototype.editUser = function (user) {	
        	var usersList = this.usersList;	
           	var url = API_BASE_URL + '/api/admin/users/'+user.id;
       		var type = 'PUT';	 
       		var data = user;
       		data['sessionToken'] = sessionMgr.getUserContext()['sessionToken'];
       		var callback = function(response) { usersList.updateUser(response); };
       		$.ajax({
     		   type: type,
     		   contentType: "application/x-www-form-urlencoded",
     		   url: url,     
     		   async: true,
     		   data: JSON.stringify(data),
     		   success: function(response) {
     			   callback(response);
     		   },
     		   error: function(response) {
     			   var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
     			   if(response.status == 409) {
     				   var responseText = JSON.parse(response.responseText);
       				   errorMsg = response.status + " " + response.statusText + ": " + localize("Username {_username} is bisy. User cannot be edited. Please, choose another username.", {_username:responseText['username']});
     			   }
     			  displayUserNotification('danger', [errorMsg]);
     		   },
     		   dataType: "json"               
       		});
        };
        
        /**
    	 *  Delete specified user from the system.
    	 *  Call Delete User REST WS.
    	 *  @param id int The id of the user to be deleted
    	 */
        UsersManager.prototype.deleteUser = function (id) {
        	var usersList = this.usersList;	
        	var url = API_BASE_URL + '/api/admin/users/' + id;
       		var type = 'DELETE';	 
       		var data = { 'sessionToken': sessionMgr.getUserContext()['sessionToken'] };
           	var callback = function(response) { usersList.removeUser(id); };
            $.ajax({
        		   type: type,
        		   contentType: "application/x-www-form-urlencoded",
        		   url: url,     
        		   async: true,
        		   data: JSON.stringify(data),
        		   success: function(response) {
        			   callback(response);
        		   },
        		   error: function(response) {
        			   var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
        			   displayUserNotification('danger', [errorMsg]);
        		   },
        		   dataType: "json"               
            });	
        };
        
        /**
    	 *  Reset password of the user specified.
    	 *  Call Reset Password REST WS.
    	 *  @param id int The id of the user specified
    	 */
        UsersManager.prototype.resetPassword = function (id) {
        	var usersList = this.usersList;	
        	var url = API_BASE_URL + '/api/admin/users/password/' + id;
       		var type = 'PUT';	 
       		var data = { 'sessionToken': sessionMgr.getUserContext()['sessionToken'] };
           	var callback = function(response) { };
            $.ajax({
        		   type: type,
        		   contentType: "application/x-www-form-urlencoded",
        		   url: url,     
        		   async: true,
        		   data: JSON.stringify(data),
        		   success: function(response) {
        			   callback(response);
        		   },
        		   error: function(response) {
        			   var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
        			   displayUserNotification('danger', [errorMsg]);
        		   },
        		   dataType: "json"               
           });		
        };

/**
 * Users List UI Object.
 * Represents a table with users, provides CRUD for users.
 */
	
	/**
	 * Users List Constructor.
	 * @param usersMgr UsersManager Reference to the UsersManager
	 */
	UsersList = function (usersMgr) {
		this.usersMgr = usersMgr;
        this.createUserDialog = new CreateUserDialog(this.usersMgr);
		this.editUserDialog = new EditUserDialog(this.usersMgr); 
	};

	/**
	 * Users List Method.
	 */
    	
    	/**
    	 * Draw the table with users and populates it with user data.
    	 * Initialize Create User and Edit User dialogs to be ready for use.
    	 * @param users object[] Array with users objects
    	 */
    	UsersList.prototype.populateList = function(users) {

    		var self = this;
    		var usersMgr = this.usersMgr;
    		
    		// convert user data to table row objects
    		var userObjects = [];
       		for(var i=0; i<users.length; i++) {
        		var user = users[i];
        		var rowData = buildUserRowData(user);
        		userObjects.push(rowData);
        	}
       		
       		// initialize a jquery datatables table with the specified data
       		var table = $('#usersTable').DataTable( {
    			"aaSorting": [],
    			"data": userObjects,
    			"aLengthMenu": [5, 10, 20, 50],
    			"aoColumns": [
    			              { "mData": "user" },
    			              { "mData": "boschId" },
    			              { "mData": "edit" },
    			              { "mData": "delete" },
    			              {	"mData": "id"},
    			              {	"mData": "username"},
    			              {	"mData": "firstname"},
    			              {	"mData": "lastname"},
    			              {	"mData": "isAdmin"},
    			              {	"mData": "customers"}
    			          ],
    			"aoColumnDefs": [
							   { "width": "7%", "targets": 2, "sortable": false, "searchable": false },
							   { "width": "7%", "targets": 3, "sortable": false, "searchable": false },
							   { "targets": 4, "visible": false},
							   { "targets": 5, "visible": false},
							   { "targets": 6, "visible": false},
							   { "targets": 7, "visible": false},
							   { "targets": 8, "visible": false},
							   { "targets": 9, "visible": false},
    			              ],
    			"aaSorting": [[ 0, "asc" ]],
    			"language": {
        			"decimal":        "",
        			"emptyTable":     localize("No data available in table"),
        			"info":           localize("Showing _START_ to _END_ of _TOTAL_ entries"),
        			"infoEmpty":      localize("Showing 0 to 0 of 0 entries"),
        			"infoFiltered":   localize("(filtered from _MAX_ total entries)"),
        			"infoPostFix":    "",
        			"thousands":      ",",
        			"lengthMenu":     localize("Show _MENU_ entries"),
        			"loadingRecords": localize("Loading..."),
        			"processing":     localize("Processing..."),
        			"search":         localize("Search:"),
        			"zeroRecords":    localize("No matching records found"),
        			"paginate": {
        				"first":      localize("First"),
        				"last":       localize("Last"),
        				"next":       localize("Next"),
        				"previous":   localize("Previous")
        			},
        			"aria": {
        				"sortAscending":  localize(": activate to sort column ascending"),
        			    "sortDescending": localize(": activate to sort column descending")
        			}
        		}
   			});
    			 
   			 // delete button click handler
   			$('#usersTable tbody').on('click', '.delete-user', function () {
   				var id = $(this).data("id");
   				var username = $(this).data("username");
   				bootbox.confirm({
      	       		'message': localize("Are you sure you want to delete the selected user?"),
      	       		'buttons': {
      	       			'confirm': {
      	       				'label': localize('OK')
      	       			},
      	       			'cancel': {
      	       				'label': localize('Cancel')
      	       			}
      	       		},
      	       		'callback': function(result) {
          	       		if(result) {
          	       			usersMgr.deleteUser(id);
          	       		}
      	       		}
      	       	}); 
    		});
    			 
   			// edit button click handler
   			$('#usersTable tbody').on('click', '.edit-user', function () {   			
   				var id = $(this).data("id");
   				self.editUserDialog.show(id, this);
    		});
        
   			// disable salssa_admin for deletion
   			var adminDeleteLink = $('.delete-user[data-username="salssa_admin"]')[0];
   			if(adminDeleteLink != null) {
   				$(adminDeleteLink).attr("disabled", true);
   				$(adminDeleteLink).css("pointer-events", "none");

   			}
   			   			
   			// initialize create/edit dialogs 
   			this.createUserDialog.initialize();
   			this.editUserDialog.initialize();		
        };
    	
    	 /**
    	 *  Create user callback - update the table by adding a row for the new user created.
    	 *  @param user object Newly created user data
    	 */
       UsersList.prototype.addUser = function (user) {
    		var table = $('#usersTable').DataTable();	
    		var newUserRowData = buildUserRowData(user);    		
    		table.row.add(newUserRowData);
    		$("#usersTable").dataTable().fnSort([[4, "desc"]]); 
        };
    	
    	/**
    	 *  Update user callback - update the corresponding user row in the table.
    	 *  @param user object Updated user data
    	 */
        UsersList.prototype.updateUser = function (user) {
        	
        	var targetEditBtn = $('.edit-user[data-id="' + user.id +'"]')[0];
        	if(targetEditBtn != null) {
        		var table = $('#usersTable').DataTable();
        		var rowToUpdate = targetEditBtn.parentNode.parentNode;
            	var updatedRowData = buildUserRowData(user);
        		table.row(rowToUpdate).data(updatedRowData);
        		//$("#usersTable").dataTable().fnSort([[4, "desc"]]); 
        		displayUserNotification('success', [localize('User was successfully updated.')]);
        	}  
        	
        	// if current user is eddited, update user cookie and navbar
        	if(user.id == sessionMgr.getUserContext().id) { 		
   				var userContexttoUpdate = sessionMgr.getUserContext();
        		userContexttoUpdate['userid'] = user.id;
        		userContexttoUpdate['username'] = user['username'];
        		userContexttoUpdate['isAdmin'] = user['isAdmin'];
        		userContexttoUpdate['firstname'] = user['firstname'];
        		userContexttoUpdate['lastname'] = user['lastname'];
        		userContexttoUpdate['customers'] = user['customers'];   
        		userContexttoUpdate['sessionToken'] = user['sessionToken'];   
        		userContexttoUpdate['shouldChangePassword'] = user['shouldChangePassword'];   		
        		updateCookie('userData', JSON.stringify(userContexttoUpdate));
        		$('nav').remove();
        		drawNavbar(localize("SALSSA2"), APP_BASE_URL, {}, '.usr-mng-link', sessionMgr.getUserContext(), sessionMgr);     		
        		if(user['isAdmin'] != 1) {
        			window.location.href = APP_BASE_URL;
        		}
   			}
        };
        
        /**
    	 *  Delete user callback - update the table by removing the corresponding row.
    	 *  @param id int The id of the deleted user to be removed from the list
    	 */
        UsersList.prototype.removeUser = function (id) {
        	var targetDeleteBtn = $('.delete-user[data-id="' + id +'"]')[0];
        	if(targetDeleteBtn != null) {
        		var rowToDelete = targetDeleteBtn.parentNode.parentNode;
    	        var table = $('#usersTable').DataTable();
    	        table.row(rowToDelete).remove().draw();     
        	}   		 	
        };


/**
 * Create User Modal Dialog.
 */
	
	/**
	 * Create User Dialog Constructor
	 */
	CreateUserDialog = function (usersMgr) {
		this.usersMgr = usersMgr;
	};

    	/**
    	 * Set up "Create User" dialog
    	 */
    	CreateUserDialog.prototype.initialize = function() {   			
    		var createUserDialog = this;
    		$("#createUserBtn").on('click', function() {
    			$("#createUserForm").submit();
    		});
    		$("#createUserForm").on("submit", function(e) {				
    			createUserDialog.submitForm(e);
    		});
    		$('body').on('shown.bs.modal', '#createUserDialog', function () { // clear form on dialog hide
    			$('input, text').placeholder();
    		});
    		$('body').on('hidden.bs.modal', '#createUserDialog', function () { // clear form on dialog hide
    			createUserDialog.clear(this);
    		});
    		this.populateCustomersList();
    	};
    
    	/**
    	 * Clear "Create User" form 
    	 */
    	CreateUserDialog.prototype.clear = function(dialog) {
    		$("#formErrors").html(""); // clear errors area
    		$('#createUserForm').get(0).reset(); // reset the form
    		$("#username").val(null);
    		$("#pass").val(null);
    		$("#firstName").val(null);
    		$("#lastName").val(null);
    		$("#isAdmin").prop('checked', false);
   		 	$("#customersSelect").multiselect('refresh');
    		$(dialog).data('bs.modal', null);
    		$(dialog).removeData('bs.modal');
    	};
    	
    	/**
    	 * Validate "Create User" form 
    	 */
    	CreateUserDialog.prototype.validateForm = function() {
    		    		
    		var errorMessages = [];
    		var username = $("#username").val() != null ? $("#username").val().trim() : null;
    		var password = $("#pass").val() != null ? $("#pass").val().trim() : null;
    		var firstname = $("#firstName").val() != null ? $("#firstName").val().trim() : null;
    		var lastname = $("#lastName").val() != null ? $("#lastName").val().trim() : null;
    		var customers = $("#customersSelect").val();
    		
    		// check for username
    		if(username == null || username == "") {
    			errorMessages.push(localize("Username is required.") + "\n");
    	    }
    		// check for password
    		if(password == null || password == "") {
    			errorMessages.push(localize("Password is required.") + "\n");
    	    }
    		// check for first name
    		if(firstname == null || firstname == "") {
    			errorMessages.push(localize("First Name is required.") + "\n");
    	    }
    		// check for last name
    		if(lastname == null || lastname == "") {
    			errorMessages.push(localize("Last Name is required.") + "\n");
    	    }
    		// check for customers
    		if(customers == null || customers.length == 0) {
    			errorMessages.push(localize("Cusotmers selection is required.") + "\n");
    	    }
    				
    		// check for duplicate usernames
    	    var tableData = $("#usersTable").DataTable().rows().data();
    	    for(var j=0; j<tableData.length; j++) {
    			if(tableData[j]['username'] == username) {
    				errorMessages.push(localize("Username is bisy. Please, choose another one."));
    				break;
    			} 
    		}               
    	    return errorMessages;
    	};

    	/**
    	 * Submit "Create User" form - call Create User REST WS
    	 */
    	CreateUserDialog.prototype.submitForm = function(e) {	

    		e.preventDefault(); // prevent form submit
    		
    		var errorMessages = this.validateForm(); // validate form
    		if(errorMessages.length > 0) {
    			displayNotification('danger', errorMessages, '#formErrors', false); // display errors if validation fials
    			return false;
    		} 			
    		
           	var username = $("#username").val().trim();
    		var first = $("#firstName").val().trim();
    		var last = $("#lastName").val().trim();
    		var password = $("#pass").val().trim();
    		var customers = $("#customersSelect").val();
    		var isAdmin = $("#isAdmin").is(":checked");
           	var userData = { // request data
       			'username': username,
       			'password': password,
       			'firstName': first,
       			'lastName': last,
       			'isAdmin': isAdmin,
       			'customers': customers
           	};
           	var usersMgr = this.usersMgr;
           	usersMgr.createUser(userData);
           	
           	$('#createUserDialog').modal('hide')
    		return false;
    	};
    	
    	/**
    	 * Fill in customers selections list.
    	 */
    	CreateUserDialog.prototype.populateCustomersList = function() {
    		
    		// add the customer select
    		var customersSelectHtml = '';
    	    var customersList = config['customers'];
    	    for(var i=0; i<customersList.length; i++) {
    	    	customersSelectHtml += '<option value="' + customersList[i] + '" >' + customersList[i] + "</option>";
    	    }
    		$("#customersSelect").html(customersSelectHtml);
    		
    	    $('#customersSelect').multiselect({
                'nonSelectedText': localize('Select Customer'),
                'includeSelectAllOption': true,
                'selectAllValue': 'select-all-value',
                'selectAllNumber': true,
                'nSelectedText': localize("selected"),
	            'allSelectedText': localize('All Customers'),
	            'selectAllText': localize('Select All'),
                'onChange': function(option, checked, select) {
                }
            });
    	};


/**
 * Edit User Modal Dialog 
 */
	
	/**
	 * Edit User Dialog Constructor
	 */
	EditUserDialog = function (usersMgr) {
		this.usersMgr = usersMgr;
	};

	/**
	 * Edit User Dialog Methods
	 */
    	
    	/**
    	 * Set up "Edit User" dialog.
    	 */
    	EditUserDialog.prototype.initialize = function() { 	
    		var editUserDialog = this;
    		$("#editUser").off('click').on('click', function(e) {
    			editUserDialog.submitForm(e); // submit create form on Create btn click
    		});
    		$("#resetPassword").off('click').on('click', function(e) {
    			editUserDialog.resetPassword(e);
    		});
    		$('body').on('hidden.bs.modal', '#editUserDialog', function () { // clear form on dialog hide
    			editUserDialog.clear(this);
    		});
    	};

    	/**
    	 * Clear "Edit User" form.
    	 * @param dialog jQuery object Edit Dialog main element
    	 */
    	EditUserDialog.prototype.clear = function(dialog) {
    		 $("#editFormErrors").html("");
    		 $('#editUserForm').get(0).reset();
    		 $("#editIsAdmin").prop('checked', false);
    		 $("#editCustomersSelect").multiselect('destroy');
    		 $(dialog).data('bs.modal', null);
    		 $(dialog).removeData('bs.modal');
    	};
    	
    	/**
    	 * Validate "Edit Slide Album" form
    	 */
    	EditUserDialog.prototype.validateForm = function() {
    		
    		var errorMessages = [];
    		var username = $("#editUsername").val() != null ? $("#editUsername").val().trim() : null;
    		var password = "password";
    		var firstname = $("#editFirstName").val() != null ? $("#editFirstName").val().trim() : null;
    		var lastname = $("#editLastName").val() != null ? $("#editLastName").val().trim() : null;
    		var customers = $("#editCustomersSelect").val();
    		
    		// check for username
    		if(username == null || username == "") {
    			errorMessages.push(localize("Username is required.") + "\n");
    	    }
    		// check for password
    		if(password == null || password == "") {
    			errorMessages.push(localize("Password is required.") + "\n");
    	    }
    		// check for first name
    		if(firstname == null || firstname == "") {
    			errorMessages.push(localize("First Name is required.") + "\n");
    	    }
    		// check for last name
    		if(lastname == null || lastname == "") {
    			errorMessages.push(localize("Last name is required.") + "\n");
    	    }
    		// check for customers
    		if(customers == null || customers.length == 0) {
    			errorMessages.push(localize("Cusotmers selection is required.") + "\n");
    	    }
    				
    		// check for duplicate usernames
    	    var tableData = $("#usersTable").DataTable().rows().data();
    		var id = $("#idToEdit").val();
        	var currentUsername = $($('.delete-user[data-id="' + id +'"]')[0]).data("username");
        	
    	    for(var j=0; j<tableData.length; j++) {
    			if(tableData[j]['username'] == username && username != currentUsername) {
    				errorMessages.push(localize("Username is bisy. Please, choose another one."));
    				break;
    			} 
    		}               
    	    return errorMessages;
    	};
    	
    	/**
    	 * Submit "Edit User" form - call Edit User WS
    	 */
    	EditUserDialog.prototype.submitForm = function(e) {	
    		
    		e.preventDefault();
    		
    		var errorMessages = this.validateForm(); // validate form
    		if(errorMessages.length > 0) {
    			displayNotification('danger', errorMessages, '#editFormErrors', false); // display errors if validation fials
    			return false;
    		} 			
    		var id = $("#idToEdit").val();
           	var username = $("#editUsername").val().trim();
    		var first = $("#editFirstName").val().trim();
    		var last = $("#editLastName").val().trim();
    		var password = $("#editPass").val().trim();
    		var customers = $("#editCustomersSelect").val();
    		var isAdmin = $("#editIsAdmin").is(":checked");
           	var userData = { // request data
           		'id': id,
       			'username': username,
       			'password': password,
       			'firstname': first,
       			'lastname': last,
       			'password': password,
       			'isAdmin': isAdmin,
       			'customers': customers
           	};	
           	userData['currentUser'] = sessionMgr.getUserContext().id;
        	var usersManager = this.usersMgr;
           	usersManager.editUser(userData);
           	
           	$('#editUserDialog').modal('hide')
    		return false;
    	};
    	
    	/**
    	 * Reset user password
    	 * @param e 
    	 */
    	EditUserDialog.prototype.resetPassword = function(e) {
    		e.preventDefault();
    		var id = $("#idToEdit").val();
    		this.usersMgr.resetPassword(id);
           	$('#editUserDialog').modal('hide')
           	return false;
    	};
    	
    	/**
    	 * Pre-select the dialog with the data of the user to be edited and show it.
    	 * @param id int The id of the user to be edited
    	 * @param editButtonElement jQuery object The Edit button element fired the Edit action
    	 */
    	EditUserDialog.prototype.show = function(id, editButtonElement) {	
    		
    		$("#idToEdit").val(id);
    		var rowToUpdate = editButtonElement.parentNode.parentNode;
    		var table = $('#usersTable').DataTable();
    		var data = table.row(rowToUpdate).data();
    		$("#editUsername").val(data['username']);
			$("#editFirstName").val(data['firstname']);
			$("#editLastName").val(data['lastname']);
			if(data['isAdmin'] == 1) {
				$("#editIsAdmin").prop('checked', true);
			}
			var customers = data['customers'].split(",");
			
			// add the customer select
    		var customersSelectHtml = '';
    	    var customersList = config['customers']; // TODO: get from user
    	    for(var i=0; i<customersList.length; i++) {
    	    	customersSelectHtml += '<option value="' + customersList[i] + '" ' + ($.inArray(customersList[i], customers) !== -1 ? ' selected' : '')  + '>' + customersList[i] + "</option>";
    	    }
    		$("#editCustomersSelect").html(customersSelectHtml);
    	    $('#editCustomersSelect').multiselect({
                'nonSelectedText': localize('Select Customer'),
                'includeSelectAllOption': true,
                'selectAllValue': 'select-all-value',
                'selectAllNumber': true,
                'nSelectedText': localize("selected"),
	            'allSelectedText': localize('All Customers'),
	            'selectAllText': localize('Select All'),
                'onChange': function(option, checked, select) {
                    
                },
                'buttonClass': 'form-control editCustomersSelect'
            });
    	  
			$("#editPass").val("password");
    	    
			// show the dialog
		    $('#editUserDialog').modal('show');  			   
    	};

/****************************** Helper Methods******************************/

/**
 * Build users table row data based on the passed user data
 * @param user object User data
 */
function buildUserRowData(user) {

	var customers = user['customers'];
	var customersStr = "";
	if(customers == null || customers.length == 0) {
		customersStr = "None";
	} else {
		for(var j=0; j<customers.length; j++) {
			customersStr += customers[j] + (j == customers.length-1 ? " " :  ", ");
		}
	}
	var headerStr = '';
	var editCol = '<a href="#" title="' + localize("Edit User") + '" class="edit-user btn btn-danger btn-sm"" data-id="'+ user.id + '" data-username="'+ user['username'] + '"> <span class="glyphicon glyphicon-edit"></span> </a>';
	var deleteCol = '';
	if(user.id == sessionMgr.getUserContext().id) {
		headerStr = '<h4 class="list-group-item-heading">' + user['firstname'] + ' ' + user['lastname'] + ' <i>(YOU)</i></h4>';
		deleteCol = '<a href="#"  title="' + localize("Delete User") + '" class="delete-user btn btn-primary btn-sm disabled" data-id="'+ user.id + '" data-username="'+ user['username'] + '"> <span class="glyphicon glyphicon-trash"></span> </a>';
	} else {
		headerStr = '<h4 class="list-group-item-heading">' + user['firstname'] + ' ' + user['lastname'] + '</h4>';
		deleteCol = '<a href="#"  title="' + localize("Delete User") + '" class="delete-user btn btn-primary btn-sm" data-id="'+ user.id + '" data-username="'+ user['username'] + '"> <span class="glyphicon glyphicon-trash"></span> </a>';
	}
    var smallText = "";
    if(user['isAdmin'] == 1) {
    	smallText = '<p style="font-size:17px;" class="list-group-item-text"><span class="label label-warning">' + localize("Customers") + ': <i> ' +  customersStr + '</i> </span>  <span class="label label-info label-as-badge isAdmin">' + localize("Admin") + '</span></p>';
    } else {
    	smallText = '<p style="font-size:17px;" class="list-group-item-text"><span class="label label-warning">' + localize("Customers") + ': <i> ' +  customersStr + '</p>';
    }
	var titleCol = '<div class="list-group" data-id="' + user.id + '">' + headerStr + smallText + '</div>';
	var boschIdCol = '<b>' + user['username'] + '</b>';
	var idColumn = user.id;
	var usernameColumn = user['username'];
	var firstnameColumn = user['firstname'];
	var lastnameColumn = user['lastname'];
	var isAdminColumn = user['isAdmin'];
	var customersColumn = user['customers'] != null ? user['customers'].toString() : "";
	var rowData = {'user': titleCol, 'boschId': boschIdCol, 'edit': editCol, 'delete': deleteCol, 'id': idColumn, 'username': usernameColumn, 'firstname': firstnameColumn, 'lastname': lastnameColumn, 'isAdmin': isAdminColumn, 'customers': customersColumn };
	
	return rowData;
}
/*********************************************************************************************************/

