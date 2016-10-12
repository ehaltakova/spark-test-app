/** Called when user.html page is loaded*/
$( document ).ready(function() {
	
	if(sessionMgr.isSetUserContext() == false) { // redirect to login page if user is not logged in
		window.location.href = APP_BASE_URL + "/login";
	} 
	var authManager = new AuthManager(sessionMgr);

	if(!sessionMgr.isAdminUser() && !sessionMgr.hasPermissions()) {
		displayUserNotification("warning", [localize('You are not allowed to proceed. Please, change your password first.')]);
	}
	
	var links = [];
	var link = {};
	link.name = sessionMgr.getUserContext()['username'];
	link.cssClass = "user-page-link";
	link.url = window.location.href;
	links.push(link);
	drawNavbar(localize("SALSSA2"), APP_BASE_URL, links, '.user-page-link', sessionMgr.getUserContext(), authManager);
	
	// placeholders localization
	$(".user-name").attr("placeholder", localize("Bosch Active Directory ID"));
	$(".user-first-name").attr("placeholder", localize("First Name"));
	$(".user-last-name").attr("placeholder", localize("Last Name"));
	$(".user-pass").attr("placeholder", localize("Password"));
	
	// populate user form
	var user = sessionMgr.getUserContext();
	$("#idToEdit").val(user['id']);
	$("#editFirstName").val(user['firstname']);
	$("#editLastName").val(user['lastname']);
	if(!sessionMgr.isAdminUser() && !sessionMgr.hasPermissions()) {
		$("#editPass").val("toChange");
	} else {
		$("#editPass").val("password");
	}

	//$("#editUsername").val(user.username);
	//if(user.isAdmin == 1) {
	//	$("#editIsAdmin").prop('checked', true);
	//}
	//var customers = user.customers;
	
	// add the customer select
	/*var customersSelectHtml = '';
    var customersList = config.customers; // TODO: get from user
    for(var i=0; i<customersList.length; i++) {
    	customersSelectHtml += '<option value="' + customersList[i] + '" ' + ($.inArray(customersList[i], customers) !== -1 ? ' selected' : '')  + '>' + customersList[i] + "</option>";
    }
	$("#editCustomersSelect").html(customersSelectHtml);
    $('#editCustomersSelect').multiselect({
        nonSelectedText: 'Select Customer',
        includeSelectAllOption: true,
        selectAllValue: 'select-all-value',
        selectAllNumber: true,
        onChange: function(option, checked, select) {
            
        },
        buttonClass: 'form-control editCustomersSelect'
    });*/
      
	// update click handler
	$("#editUser").off('click').on('click', function() {

		// validate form 
		var errorMessages = [];
		var password = $("#editPass").val() != null ? $("#editPass").val().trim() : null;
		var firstname = $("#editFirstName").val() != null ? $("#editFirstName").val().trim() : null;
		var lastname = $("#editLastName").val() != null ? $("#editLastName").val().trim() : null;
		//var username = $("#editUsername").val() != null ? $("#editUsername").val().trim() : null;
		//var customers = $("#editCustomersSelect").val();
		
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
		// check for username
		/*if(username == null || username == "") {
			errorMessages.push("Username is required. \n");
	    }
		// check for customers
		if(customers == null || customers.length == 0) {
			errorMessages.push("Cusotmers selection is required. \n");
	    }*/
				
		// check for duplicate usernames
	    /*var tableData = $("#usersTable").DataTable().rows().data();
		var id = $("#idToEdit").val();
    	var currentUsername = $($('.delete-user[data-id="' + id +'"]')[0]).data("username");
    	
	    for(var j=0; j<tableData.length; j++) {
			if(tableData[j].username == username && username != currentUsername) {
				errorMessages.push("Username is bisy. Please, choose another one.");
				break;
			} 
		}*/               
	        		
		if(errorMessages.length > 0) {
			displayNotification('danger', errorMessages, '#editFormErrors', false); // display errors if validation fials
			return false;
		} 			
		
		// call Update User REST WS
		var id = $("#idToEdit").val();
		var first = $("#editFirstName").val().trim();
		var last = $("#editLastName").val().trim();
		var password = $("#editPass").val().trim();
       	var username = user['username']; // this could not be changed via the UI
		var customers = user['customers']; // this could not be changed via the UI
		var isAdmin = user['isAdmin']; // this could not be changed via the UI
       	var userData = { // request data
       		'id': id,
   			'username': username,
   			'password': password,
   			'firstname': first,
   			'lastname': last,
   			'password': password,
   			'isAdmin': sessionMgr.getUserContext()['isAdmin'],
   			'customers': customers
       	};	
       	userData['currentUser'] = sessionMgr.getUserContext().id;
    
       	var url = API_BASE_URL + '/api/admin/users/'+user.id;
   		var type = 'PUT';	 
   		var data = userData;
   		var usrContext = sessionMgr.getUserContext();
    	data['userid'] = usrContext.id;
    	data['sessionToken'] = usrContext['sessionToken'];
    	data['username'] = usrContext['username'];
    	data['customers'] = usrContext['customers'];
   		var callback = function(response) {
   			if(response.id == sessionMgr.getUserContext().id) { 		
   				var userContexttoUpdate = sessionMgr.getUserContext();
        		userContexttoUpdate['userid'] = response.id;
        		userContexttoUpdate['username'] = response['username'];
        		userContexttoUpdate['isAdmin'] = response['isAdmin'];
        		userContexttoUpdate['firstname'] = response['firstname'];
        		userContexttoUpdate['lastname'] = response['lastname'];
        		userContexttoUpdate['customers'] = response['customers'];   	
        		userContexttoUpdate['shouldChangePassword'] = response['shouldChangePassword'];   		
        		updateCookie('userData', JSON.stringify(userContexttoUpdate));
        		$('nav').remove();
        		drawNavbar(localize("SALSSA2"), APP_BASE_URL, links, '.user-page-link', sessionMgr.getUserContext(), sessionMgr);
        		if(response['sessionToken'] != null) {
                	// update session token if returned
            		sessionMgr.updateUserContext({'sessionToken': response['sessionToken']});
            	}
        		window.location = APP_BASE_URL;
   			}
   		};
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
	});
});
