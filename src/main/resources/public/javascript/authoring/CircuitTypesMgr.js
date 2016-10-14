/**
 * Slide Album Circuit Types Manager.
 * Implements functions for managing circuit types in the slide album:
 * - circuit types CRUD;
 * - assign circuit type to a wire.
 * It creates and initializes circuit types list and provide the option to assign circuit types to wires.
 * It handles execution of calls to the REST API to save changes made.
 * Corresponds to the Circuit Types tab.
 */    
	
	/**
	 * CircuitTypesMgr constructor
	 * @param slideAlbum SlideAlbum
	 */
	CircuitTypesMgr = function (slideAlbum) {
		this.slideAlbum = slideAlbum;
		this.wiringDiagram = this.slideAlbum.wiringDiagram;
		this.restApiUtil = new RESTAPIUtil();
		this.circuitTypesList = null;
		this.wiresCircuitTypesMgr = null;
		this.isDirty = false;
	};

	/**
	 * CircuitTypesMgr methods
	 */
    		
    	CircuitTypesMgr.prototype.initialize = function() {
    		var self = this;
    		
    		// init and show slide album circuit types list 
			this.circuitTypesList = new CircuitTypesList(this);
			this.circuitTypesList.initialize();
			
			// handle assignment of circuit types to wires
			this.wiresCircuitTypesMgr = new WiresCircuitTypesMgr(this);
			this.wiresCircuitTypesMgr.initialize();
			
			// attach event handler for save the circuit types list and assignments
			$('#saveCircTypesData').on('click', function() {
				self.saveData();
			});
     	};
    	
    	/**
    	 * Save user defined circuit type data for a slide album.
    	 * This includes circuit type list definitions and assignments of circuit types to wires.
    	 * @param title string The title of the slide album specified
    	 * @param customer string The customer of the slide album specified
    	 * @param circuitTypesData array User defined circuit type data to be saved
    	 */
    	CircuitTypesMgr.prototype.saveCircuitTypesData = function (title, customer, circuitTypesData) { 
    	    var url = API_BASE_URL + '/api/saveCircuitTypesData';
    	    var type = 'POST';	 
    	    var data = {'title':title, 'customer': customer, 'circuitTypesData': circuitTypesData};
    	    var callback = (function(resp) { 
    	    	displayUserNotification('success', [localize('Circuit Types definitions were successfully saved.')]);
        	    this.isDirty = false;
    	    }).bind(this);
    	    this.restApiUtil.execute(url, type, data, callback, true);	   	
     	};
    	
    	/**
    	 * Save user defined circuit type list definitions for a slide album.
    	 * @param title string The title of the slide album specified
    	 * @param customer string The customer of the slide album specified
    	 * @param circuitTypesList array User defined circuit types list to be saved
    	 */
    	CircuitTypesMgr.prototype.saveCircuitTypesList = function (title, customer, circuitTypesList) { 
    	    var url = API_BASE_URL + '/api/saveCircuitTypesList';
    	    var type = 'POST';	 
    	    var data = {'title':title, 'customer': customer, 'circuitTypesList': circuitTypesList};
    	    var callback = function(resp) { 
    	    	displayUserNotification('success', [localize('Circuit Types list definitions was successfully saved.')]);
    	    };
    	    this.restApiUtil.execute(url, type, data, callback, true);	   	
     	};
    	
    	/**
    	 * Save user defined circuit type assignments for a slide album.
    	 * @param title string The title of the slide album specified
    	 * @param customer string The customer of the slide album specified
    	 * @param circuitTypesAssignments array User defined circuit type assignments to be saved
    	 */
    	CircuitTypesMgr.prototype.saveCircuitTypesAssignments = function (title, customer, circuitTypesAssignments) { 
    	    var url = API_BASE_URL + '/api/saveCircuitTypesAssignments';
    	    var type = 'POST';	 
    	    var data = {'title':title, 'customer': customer, 'circuitTypesAssignments': circuitTypesAssignments};
    	    var callback = function(resp) { 
    	    	displayUserNotification('success', [localize('Circuit Type assignments were successfully saved.')]);
    	    };
    	    this.restApiUtil.execute(url, type, data, callback, true);	   	
    	};
    	
    	/**
    	 * Saves the whole circuit types data - circuit types list and circuit types assignments.
    	 */
    	CircuitTypesMgr.prototype.saveData = function() {
    		var circuitTypesData = {};
        	var newCircuitTypes = this.circuitTypesList.collectCircuitTypesfromList();
        	circuitTypesData['circuitTypes'] = newCircuitTypes;
        	circuitTypesData['circuitTypesToWires'] = this.wiringDiagram.circuitTypesToWires;
			this.saveCircuitTypesData(this.wiringDiagram.slideAlbumData['title'], this.wiringDiagram.slideAlbumData['customer'], circuitTypesData);
     	};
     	
     	/**
     	 * Apply circuit types list and assignments changes to the wire diagram.
     	 */
     	CircuitTypesMgr.prototype.applyChanges = function() {
     		var newCircuitTypes = this.circuitTypesList.collectCircuitTypesfromList();
        	this.wiringDiagram.circuitTypes = {};
        	for(var i=0; i<newCircuitTypes.length; i++) { 
        		var newCircTypeObj = new $.CircuitType(newCircuitTypes[i].type, newCircuitTypes[i].name, newCircuitTypes[i].color);
        		this.wiringDiagram.circuitTypes[newCircTypeObj.type] = newCircTypeObj;
        	}        	
        	var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		if(wire.circuitType != null) {
        			wire.updateCircuitType(this.wiringDiagram.circuitTypes[wire.circuitType.type]);
        		} else {
        			wire.updateCircuitType(null);
        		}
     		}        
     	};


/**
 * Circuit Types List UI Control.
 * This is an editable list providing the option to add, update or remove circuit types.
 * By default (if no custom definition exists) the list is initialized with the 8 standard electrical circuit types (read from configuration file).
 */	
	/**
	 * CircuitTypesList constructor
	 * @param circuitTypesMgr CircuitTypesMgr
	 * @returns CircuitTypesList object
	 */
	CircuitTypesList = function (circuitTypesMgr) {
		this.slideAlbum = circuitTypesMgr.slideAlbum;
		this.wiringDiagram = this.slideAlbum.wiringDiagram;
		this.circuitTypesMgr = circuitTypesMgr;
	};

	/**
	 * CircuitTypesList methods
	 */
    	/**
    	 * Initialize and display circuit types list
    	 */
    	CircuitTypesList.prototype.initialize = function() {
    		    		
    		// build list data
    		var data = [];
	        for(var key in this.wiringDiagram.circuitTypes) {
	        	var circuitType = this.wiringDiagram.circuitTypes[key];
	        	var row = this.buildCircuitTypeRowData(circuitType.type, circuitType.name, circuitType.color);
	        	data.push(row);
	        }
	        var addNewRowData = this.buildAddCircTypeRowData();
	        data.push(addNewRowData);
			
	        // populate and show the list
	        this.showList(data);
	        
	        // tooltips and placeholder localization
	        $(".delete-circuit-type").attr("title", localize("Delete circuit type"));
	    	$("#addCircType").attr("title", localize("Add new circuit type"));
	    	
	    	// placeholders localization
	    	$("#circTypeType").attr("placeholder", localize("Type.."));
	    	$("#circTypeName").attr("placeholder", localize("Name.."));
	    	
			// delete button click handler
   			$('#circuitTypesTable tbody').on('click', '.delete-circuit-type', (function (e) {
   				var targetElement = e.target.nodeName.toLowerCase() != "a" ? e.target.parentNode : e.target; //NOTE target might be the the link element <a> or the inner <span> element hodling the button icon (depending on the exact mouse position)
   				var message = localize("This circuit type might be assigned to wire segments. \n Are you sure you want to delete it?");
   				bootbox.confirm({
   	      	    	'message': message,
   	      	    	'buttons': {
   	      	    		'confirm': {
   	      	    			'label': localize('OK')
   	      	    		},
   	      	    		'cancel': {
   	      	    			'label': localize('Cancel')
   	      	    		}
   	      	    	},
   	      	    	'callback': (function(result) {
   	          	   		if(result) {
   	          	   			this.removeCircuitType(targetElement);
   	          	   		}
   	      	    	}).bind(this)
   	      	    }).bind(this); 
    		}).bind(this));
   			
   			// add button click handler
   			$('#circuitTypesTable tbody').on('click', '#addCircType',  (function() {
   			    // clear old error messages
   				if($('#errorsDiv')) {
   					$('#errorsDiv').remove(); 
   				}
   				// validate user input
   				var type = $("#circTypeType").val();
   				var name = $("#circTypeName").val();
   	    		var color = $("#circTypeColor").spectrum('get').toHexString();
   	    		if(type == null || type == "") {
   	    			displayNotification('danger', [localize('Please, fill in circuit type.')], '#circuitTypesTable_info', true);
   	    			return;
   	    		}
   	    		if(name == null || name == "") {
   	    			displayNotification('danger', [localize('Please, fill in circuit type name.')], '#circuitTypesTable_info', true);
   	    			return;
   	    		}
   				// add the circuit type
   	    		this.addCircuitType(type, name, color);
   			}).bind(this));		
        };
    	
    	/**
    	 * Populate list with data and display it.
    	 * @param data array Array of objects representing a circuit type item in the list
    	 */
    	CircuitTypesList.prototype.showList = function(data) {
    		    		
    		var table = $('#circuitTypesTable').DataTable( {
    			"aaSorting": [],
    			"paging": false,
    			"searching": false,
    			"sorting": false,
    			"data": data,
    			"aoColumns": [
    			              { "mData": "color" },
    			              { "mData": "type" },
    			              { "mData": "name" },
    			              { "mData": "action" }
    			          ],
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
    		        "zeroRecords":    localize("No matching records found")
    		    }
   			});
    		
			var selfMgr = this;
    		// enable color picker for each circuit type row
	   		$(".colorpicker").spectrum({
	   			'showPalette': true,
				'showPaletteOnly': false,
				'togglePaletteOnly': true,
				'togglePaletteMoreText': localize('more'),
  			  	'togglePaletteLessText': localize('less'),
  			  	'palette': [
  			        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
  			        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
  			        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
  			        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
  			        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
  			        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
  			        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
  			        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
  			    ],
	   			'change': function(color) {
	   				var circType = $(this).parent().next().text();
	   				var newColor = color.toHexString();
	   				selfMgr.updateColor(circType, newColor);
	   			}
	   		});
	   		
	   	    // make type and name columns editable
	   	    $('#circuitTypesTable').find('td:not(:has(>a,input))').editable(function(value, settings) {
	   	    	var table = $('#circuitTypesTable').DataTable();		
	   	    	if(table.cell(this).index()['column'] == 1) {
		   	    	var oldType = this['revert'];
		   	    	$(this).siblings().find("a.delete-circuit-type").data("type", value);
		    		selfMgr.updateCircTypeItemType(oldType, value);
	   	    	}
	   	    	selfMgr.isDirty = true;
	   	    	table.cell(this).data(value);
	   	    	return value;
	   	    }); 			

			 if(this.slideAlbum.readonly) {
			   	 $('#circuitTypesTable').find('td:not(:has(>a,input))').editable("disable");
			   	 $(".colorpicker").spectrum({
			   		 disabled: true
			   	});
			   	$(".delete-circuit-type").attr("disabled", true);
	    		$("#circTypeType").attr("disabled", true);
	    		$("#circTypeName").attr("disabled", true);
	    		$("#addCircType").attr("disabled", true);
				$(".delete-circuit-type").css('pointer-events', 'none');
				$("#addCircType").css('pointer-events', 'none');

	   	    }
        };
        
    	/** Update the color of a circuit type list item
    	 *  @param circType string The type of the circuit type list item being edited
    	 *  @param color string The new color
    	 */ 
    	CircuitTypesList.prototype.updateColor = function(circType, color) {
    		// update circuit type
    		var circtTypeObjToEdit = this.wiringDiagram.circuitTypes[circType];
    		if(circtTypeObjToEdit != null) {
    			this.wiringDiagram.circuitTypes[circType] = new $.CircuitType(circType, circtTypeObjToEdit.name, color); 
        		// update wiring diagram 
        		var wireSegments = this.wiringDiagram.wireSegments;
            	for (var key in wireSegments) {
            		var wire = wireSegments[key];
            		if(wire.circuitType != null) {
            			wire.updateCircuitType(this.wiringDiagram.circuitTypes[wire.circuitType.type]);
            		} else {
            			wire.updateCircuitType(null);
            		}
         		}  
            	this.circuitTypesMgr.isDirty = true;
    		}
        };
    	
    	/** Update the type of a circuit type list item
    	 * @param oldType string The old type of the circuit type list item being edited
    	 * @param oldType string The new type of the circuit type list item being edited
    	 */ 
    	CircuitTypesList.prototype.updateCircTypeItemType = function(oldType, newType) {
    		// update circuit type
    		var circtTypeObjToEdit = this.wiringDiagram.circuitTypes[oldType];
    		delete this.wiringDiagram.circuitTypes[oldType];
    		this.wiringDiagram.circuitTypes[newType] = new $.CircuitType(newType, circtTypeObjToEdit.name, circtTypeObjToEdit.color); 
    		// update circuit types to wires map
    		for(var wireID in this.wiringDiagram.circuitTypesToWires) {
 	        	if(this.wiringDiagram.circuitTypesToWires[wireID] == oldType) {
 	        		this.wiringDiagram.circuitTypesToWires[wireID] = newType;
 	        	}
 	        }
    		// add assignments for the wires with circ type SVG definition
    		var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		if(wire.circuitType != null) {
        			if(wire.circuitType.type == oldType) {
        				this.wiringDiagram.circuitTypesToWires[wire.id] = newType;
            			wire.updateCircuitType(this.wiringDiagram.circuitTypes[newType]);
        			}
        		}
     		}  
        	this.circuitTypesMgr.isDirty = true;
    		// no update of wiring diagram UI!
        };
    	
    	/**
    	 * Remove a circuit type from the list
    	 * @param targetElement HTMLElement The td element from the list firing the delete event
    	 */
        CircuitTypesList.prototype.removeCircuitType = function (targetElement) {
        	// update table
			var rowToDelete = targetElement.parentNode.parentNode;
	    	var table = $('#circuitTypesTable').DataTable();
	        table.row(rowToDelete).remove().draw();   
	        // update slide album circuit types list
	        var circTypeToDelete = $(targetElement).data("type");
	        delete this.wiringDiagram.circuitTypes[circTypeToDelete];
	        // update circuit types to wires map
	        for(var wireID in this.wiringDiagram.circuitTypesToWires) {
	        	if(this.wiringDiagram.circuitTypesToWires[wireID] == circTypeToDelete) {
	    	        // update wiring diagram before deleting item from the map - this works only for the new format
	        		//this.wiringDiagram.wireSegments[wireID].updateCircuitType(null);
	        		delete this.wiringDiagram.circuitTypesToWires[wireID];
	        	}
	        }   
	        // update wiring diagram
	        var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		if(wire.circuitType != null) {
        			wire.updateCircuitType(this.wiringDiagram.circuitTypes[wire.circuitType.type]);
        		} else {
        			wire.updateCircuitType(null);
        		}
     		}  
        	this.circuitTypesMgr.isDirty = true;
        };
       
        /**
         * Add new circuit type to the list
         * @param type string The new circuit type short name (type)
         * @param name string The new circuit type long name (name)
         * @param color string The color of the new circuit type
         */
        CircuitTypesList.prototype.addCircuitType = function (type, name, color) {
    	   var table = $('#circuitTypesTable').DataTable();	
    	   // remove the last row
			var trToDelete = $('#circuitTypesTable tr:last');
			table.row(trToDelete).remove();
			// add the new row
	    	var newCircTtpeRowData = this.buildCircuitTypeRowData(type, name, color);    		
	    	table.row.add(newCircTtpeRowData);
	    	// add the row allowing new circuit types creation to be inserted as a last row and redraw table
	    	var addNewRowData = this.buildAddCircTypeRowData();
	    	table.row.add(addNewRowData).draw();
			var self = this;
	    	// enable colorpicker and editable properties for the new circuit type row
	    	$(".colorpicker").spectrum({
	    		"showPalette": true,
				"showPaletteOnly": false,
				"togglePaletteOnly": true,
				"togglePaletteMoreText": localize('more'),
  			  	"togglePaletteLessText": localize('less'),
  			  	"palette": [
  			        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
  			        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
  			        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
  			        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
  			        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
  			        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
  			        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
  			        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
  			    ],
	    		"change": function(color) {
	   				var circType = $(this).parent().next().text();
	   				var newColor = color.toHexString();
	   				self.updateColor(circType, newColor);
	   			}
	    	});
	    	$('#circuitTypesTable').find('td:not(:has(>a,input))').editable(function(value, settings) {
	    		var table = $('#circuitTypesTable').DataTable();		
	   	    	if(table.cell(this).index().column == 1) {
	   	    		var oldType = this['revert'];
		   	    	$(this).siblings().find("a.delete-circuit-type").data("type", value);
		    		self.updateCircTypeItemType(oldType, value);
	   	    	}
	   	    	table.cell( this ).data( value );
	   	    	return value;
		   	});
	    	
	    	// update the circ type list
	    	this.wiringDiagram.circuitTypes[type] = new $.CircuitType(type, name, color);
	    	this.circuitTypesMgr.isDirty = true;
	    	
	    	// tooltips and placeholder localization
	        $(".delete-circuit-type").attr("title", localize("Delete circuit type"));
	    	$("#addCircType").attr("title", localize("Add new circuit type"));
	    	
	    	// placeholders localization
	    	$("#circTypeType").attr("placeholder", localize("Type.."));
	    	$("#circTypeName").attr("placeholder", localize("Name.."));
        };
        
        /**
         * Compose object representing a circuit type list item.
         * @param type string The short name (type) of the circuit type item
         * @param name string The long name (name) of the circuit type item
         * @param color string The color of the circuit type item
         * @returns JS object The object representing a circuit type list item in the expected format
         */
        CircuitTypesList.prototype.buildCircuitTypeRowData = function(type, name, color) {
        	var row = {};
        	row['type'] = type;
        	row['name'] = name;
        	row['color'] = '<input class="colorpicker" value="' + color + '"/>';
        	row['action'] = '<a href="#" title="Delete circuit type" class="delete-circuit-type" data-type="' + type + '"> <span class="glyphicon glyphicon-trash"></span> </a>';
        	return row;
        };
        
        /**
         * Compose object representing the last row of the list provifding the ability to add a new circuit type to the list
         * @returns JS object The object representing the last row of the list in the proper format
         */
        CircuitTypesList.prototype.buildAddCircTypeRowData = function() {
        	var addBtn = '<a href="#" id="addCircType" title="Add new circuit type" class="btn btn-danger btn-xs">' + localize("Add") + '</a>';
 	        var addNewRowData = {'type': '<input id="circTypeType" style="width:100%;" type="text" placeholder="Type..."/>', 
 	        				 'name': '<input id="circTypeName" style="width:100%;" "type="text" placeholder="Name..."/>', 
 	        				 'color': '<input id="circTypeColor" value="#783F04" class="colorpicker"/>', 
 	        				 'action': addBtn};
 	        return addNewRowData;
        };
        
        /**
         * Collect current list items into CircuitType objects array
         * @returns array Array of CircuitType objects corresponding to the list items
         */
        CircuitTypesList.prototype.collectCircuitTypesfromList = function() {
			var circuitTypes = [];
			var table = $('#circuitTypesTable').DataTable();	
			var itemsCount = table.rows().data().length - 1; // do not take the last row!
			for(var i=0; i<itemsCount; i++) { 
				var itemNode = $(table.row(i).node());
				var itemData = table.row(i).data();					
				var type = itemData.type;
				var name = itemData.name;
				var colorPicker = itemNode.find('.colorpicker');
	        	var color = colorPicker.spectrum('get').toHexString();
	        	var circType = {'type': type, 'name': name, 'color': color};
	        	if(this.wiringDiagram.circuitTypes[type].colorBlindBalloonFontColor != null) {
	        		circType['colorBlindBalloonFontColor'] = this.wiringDiagram.circuitTypes[type].colorBlindBalloonFontColor;
	        	}
	        	if(this.wiringDiagram.circuitTypes[type].colorBlindBalloonText != null) {
	        		circType['colorBlindBalloonText'] = this.wiringDiagram.circuitTypes[type].colorBlindBalloonText;
	        	}
				circuitTypes.push(circType);
			}
			return circuitTypes;
        };
        
        /**
         * Save circuit type definitions done to the list and apply changes
         */
        CircuitTypesList.prototype.saveCircuitTypeDefs = function() {
        	var newCircuitTypes = this.collectCircuitTypesfromList();
			this.circuitTypesMgr.saveCircuitTypesList(this.wiringDiagram.slideAlbumData['title'], this.wiringDiagram.slideAlbumData['customer'], newCircuitTypes);
        };
        
        /**
         * Apply changes to the list to the wiring diagram
         */
        CircuitTypesList.prototype.applyChanges = function() {
        	var newCircuitTypes = this.collectCircuitTypesfromList();
        	this.wiringDiagram.circuitTypes = {};
        	for(var i=0; i<newCircuitTypes.length; i++) { 
        		var newCircTypeObj = new $.CircuitType(newCircuitTypes[i].type, newCircuitTypes[i].name, newCircuitTypes[i].color);
        		this.wiringDiagram.circuitTypes[newCircTypeObj.type] = newCircTypeObj;
        	}        	
        	var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		if(wire.circuitType != null) {
        			wire.updateCircuitType(this.wiringDiagram.circuitTypes[wire.circuitType.type]);
        		} else {
        			wire.updateCircuitType(null);
        		}
     		}        	
        	//TODO: take care about actors and current slide
        };


/**
 * WiresCircuitTypesMgr.
 * Implement the logic for assigning circuit types to wires.
 * Take care about switching between animation and assignment mode when switching between Animations and Circuit Types tab.
 */	
	/**
	 * WiresCircuitTypesMgr constructor
	 * @param circuitTypesMgr CircuitTypesMgr
	 * @returns WiresCircuitTypesMgr object
	 */
	WiresCircuitTypesMgr = function (circuitTypesMgr) {
		this.slideAlbum = circuitTypesMgr.slideAlbum;
		this.wiringDiagram = circuitTypesMgr.slideAlbum.wiringDiagram;
		this.circuitTypesMgr = circuitTypesMgr;
		
		this.selectedWires = [];
		this.mode = "single"; // assingment mode (single|bulk)
	};

	/**
	 * WiresCircuitTypesMgr methods
	 */

    	/**
    	 * Initialization - take care about switching between animation and assignment mode when switching between Animations and Circuit Types tab.
    	 */
    	WiresCircuitTypesMgr.prototype.initialize = function() {
    		$("a[href='#animations']").on('shown.bs.tab', (function() {
    			 this.enableAnimationMode();
    		}).bind(this));
    		
    		$("a[href='#circuitTypes']").on('shown.bs.tab', (function() {
    			this.enableAssignmentMode(); 
				$('#circuitTypesTable').css('width', '100%').dataTable().fnAdjustColumnSizing();
    		}).bind(this));
        };
    	
    	/**
    	 * Enable circuit type assignments working mode (to be able to assign circuit type to wires).
    	 */
    	WiresCircuitTypesMgr.prototype.enableAssignmentMode = function() {
    		this.attachKeyEventHandlers(); // to handle single and bulk assignment mode
    		var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		wire.makeCold(false, true);
        		wire.flowGroupElement.attr("visibility", "hidden");
        		if(wire.circuitType != null) {
        			wire.showCircType();
        		}
        		var wireMousePathElement = wire.svg.select("#"+wire.mouseEventsPathId); 
        		wireMousePathElement.unclick();
       			wireMousePathElement.click(function(currentWire, mousePathElement, self) { 
            		return function() {
            			self.clickCircTypeWire(self.mode, currentWire, mousePathElement);
            		};
        		}(wire, wireMousePathElement, this));       			
     		}    
			this.slideAlbum.showWireLabels();
        };
    	
    	/**
    	 * Enable animation working mode (to be able to animate wires).
    	 */
    	WiresCircuitTypesMgr.prototype.enableAnimationMode = function() {
    		var wireSegments = this.wiringDiagram.wireSegments;
    		var wire = null;
    		var wireMousePathElement = null;
        	for (var key in wireSegments) {
        		wire = wireSegments[key];
        		wire.flowGroupElement.attr("visibility", "visible");
        		if(wire.circuitType != null) {
        			wire.hideCircType(); // hide circuit types indications
        		} 
        		wireMousePathElement = wire.svg.select("#"+wire.mouseEventsPathId); 
        		wireMousePathElement.unclick(); // unbind the click event 
        		$(wireMousePathElement.node).popover("destroy"); // remove the popovers
        		var wireId = wire.id;
        		if(wire.circuitType != null) {
        			wireMousePathElement.click(function(currentWire) { 
            			return function() {
            				currentWire.clickWire(); // bind the click event to show animations
            			};
         			}(wire));
        		}
     		}    
        	// pre-load actors for current slide
        	this.slideAlbum.animationsMgr.loadSlide(this.slideAlbum.animationsMgr.currentSlideIndex-1);
        };
    	
    	/**
    	 * Handle wire click event in non-animation working mode
    	 * If assignment is being done in 'single' mode - show a popover.
    	 * Otherwise - just mark the wire as selected.
    	 * @param mode string Assignment mode (single|bulk)
    	 * @param wire WireSegmentObject Wire segment object corresponding to the clicked wired
    	 * @param mousePathElement Snap element 
    	 */
    	WiresCircuitTypesMgr.prototype.clickCircTypeWire = function(mode, wire, mousePathElement) {
    		 if (mode == 'bulk') { // just mark the wire as selected
 				var circTypePathElement = wire.svg.select("#"+wire.circTypePathId);
     	    	this.selectedWires.push(wire.id);
 				circTypePathElement.attr("stroke", "blue");
 				circTypePathElement.attr("visibility", "visible");
 			} else {
 				this.attachAndShowPopover(wire, mousePathElement);
 			}
        };
    	
    	/**
    	 * Draw, initalize, bind and show circuit types selection dialog
    	 * @param wire WireSegmentObject
    	 * @param mousePathElement Snap element
    	 */
    	WiresCircuitTypesMgr.prototype.attachAndShowPopover = function(wire, mousePathElement) {
    		this.drawPopoverList();
    		$(mousePathElement.node).popover({ // show popover for single assingment
	    			'title': localize("Choose Circuit Type"), 
	    			'html' : true,
				    'content': function() {
						return $("#circTypeListPopover").html();
				    },
	    			'container':"body"
	    		}).on('show.bs.popover', function(currentWire, wireDiagram, circTypeManager) { 
	    			return function() {
	    				var selectedValue = null;
	        			$('body').off().on('change', '.popover input', function() { 
	        				selectedValue = $(this).data("value");
	         			});
	        			$('body').on('click', '#popoverSelectCircType', function() { 
	            			var selectedCircuitType = selectedValue;
	                		var selectedWireId = currentWire.id;
	                		var selectedCircTypeObject = wireDiagram.circuitTypes[selectedCircuitType];
	                		var selectedColor = selectedCircTypeObject.color;
	                		wireDiagram.circuitTypesToWires[selectedWireId] = selectedCircuitType; // update the map
	                		circTypeManager.isDirty = true;
	                		currentWire.updateCircuitType(selectedCircTypeObject); // update wire circ type
	                		currentWire.showCircType(); // update the UI
	            			var circTypePathElement = currentWire.svg.select("#"+currentWire.circTypePathId);
	        				circTypePathElement.attr("stroke", currentWire.circTypeColor);
	        				circTypePathElement.attr("visibility", "visible");
	                		$(".popover").popover().hide();
	                		$(mousePathElement.node).popover("destroy");
	         			});
	        			$('body').on('click', '#popoverResetCircType', function() { 
	            			var selectedCircuitType = selectedValue;
	                		var selectedWireId = currentWire.id;
	                		delete wireDiagram.circuitTypesToWires[selectedWireId];
	                		//wireDiagram.circuitTypesToWires[selectedWireId] = null; // update the map
	                		circTypeManager.isDirty = true;
	                		currentWire.updateCircuitType(null); // update wire circ type
	                		currentWire.showCircType(); // update the UI
//	            			var circTypePathElement = currentWire.svg.select("#"+currentWire.circTypePathId);
//	        				circTypePathElement.attr("stroke", currentWire.circTypeColor);
//	        				circTypePathElement.attr("visibility", "visible");
	                		$(".popover").popover().hide();
	                		$(mousePathElement.node).popover("destroy");
	         			});
	        			$('body').on('click', '#popoverCancelCircType', function () {
	            			$(".popover").popover().hide();	
	            			$(mousePathElement.node).popover("destroy");
	            		});
	    			};
	    	}(wire, this.wiringDiagram, this)).popover('show');
        };
    	
    	/**
    	 * Draw, initalize, bind and show circuit types selection dialog
    	 */
    	WiresCircuitTypesMgr.prototype.attachAndShowDialog = function() {
    		this.drawCircuitTypesAssignDialog();
    		$('#selectCircType').off().on('click', (function() { 
    			var selectedCircuitType = $('#circTypeForm input[type="radio"]:checked:first').data("value");
        		var wiresToUpdate = this.selectedWires;
        		for(var i=0; i<wiresToUpdate.length; i++) {
        			var currentWire = this.wiringDiagram.wireSegments[wiresToUpdate[i]];
        			var selectedCircTypeObject = this.wiringDiagram.circuitTypes[selectedCircuitType];
            		var selectedColor = selectedCircTypeObject.color;
            		this.wiringDiagram.circuitTypesToWires[currentWire.id] = selectedCircuitType; // update the map
            		this.circuitTypesMgr.isDirty = true;
            		currentWire.updateCircuitType(selectedCircTypeObject); // update wire circ type
            		currentWire.showCircType(); // update the UI
        		}
        		this.selectedWires = [];
        		$('#circTypeListDialog').modal('hide');
 			}).bind(this));
    		$('#resetCircType').off().on('click', (function() { 
    			var selectedCircuitType = $('#circTypeForm input[type="radio"]:checked:first').data("value");
        		var wiresToUpdate = this.selectedWires;
        		for(var i=0; i<wiresToUpdate.length; i++) {
        			var currentWire = this.wiringDiagram.wireSegments[wiresToUpdate[i]];
            		//self.wiringDiagram.circuitTypesToWires[currentWire.id] = null; // update the map
        			delete this.wiringDiagram.circuitTypesToWires[currentWire.id]
        			this.circuitTypesMgr.isDirty = true;
            		currentWire.updateCircuitType(null); // update wire circ type
            		currentWire.showCircType(); // update the UI
        		}
        		this.selectedWires = [];
        		$('#circTypeListDialog').modal('hide');
 			}).bind(this));
			$('#cancelCircType').on('click', function() { 
				$('#circTypeListDialog').modal('hide');
			});
			
			$('#circTypeListDialog').on('hidden.bs.modal', (function () {
				$("#circTypeForm input[type=radio]:checked").prop('checked', false);
				var wiresToUpdate = this.selectedWires;
        		for(var i=0; i<wiresToUpdate.length; i++) {
        			var currentWire = this.wiringDiagram.wireSegments[wiresToUpdate[i]];
        			var circTypePathElement = currentWire.svg.select("#"+currentWire.circTypePathId);
    				circTypePathElement.attr("stroke", currentWire.circTypeColor);
    				circTypePathElement.attr("visibility", "visible");
        		}
				this.selectedWires = [];
			}).bind(this))
			
   			$("#circTypeListDialog").modal('show');
        };
    	
    	/**
    	 * Attach key event handlers to handle assignment modes activation/deactivation
    	 */
    	WiresCircuitTypesMgr.prototype.attachKeyEventHandlers = function() {    
    		this.wiringDiagram.svgHandler.svgDoc.addEventListener("keyup", (function (e) {
    			var code = e.keyCode || e.which;
    		    if (code == '113' || code =='81' || code == '1103') {
    		    	if(this.selectedWires.length > 0) {
    		    		this.attachAndShowDialog(); // init and show the circuit types selection dialog
    		    	}
    		    	this.mode = "single";
    		    }
			}).bind(this));    		
    		this.wiringDiagram.svgHandler.svgDoc.addEventListener("keypress", (function (evt) {
    			var code = evt.keyCode || evt.which;
    			if(code == '113' || code == '81' || code == '1103') { // if the specific button is hold enable the bulk assignment mode
    				this.mode = "bulk";
    			}
			}).bind(this)); 		
        };
    	    	
    	/**
    	 * Draw circuit types selections in a modal dialog 
    	 */
    	WiresCircuitTypesMgr.prototype.drawCircuitTypesAssignDialog = function() {
    		var html = "";
			html += '<form id="circTypeForm" style="margin: 0 7px 5px 7px">';
			for(var key in this.wiringDiagram.circuitTypes) {
				var circType = this.wiringDiagram.circuitTypes[key];
				html += '<div class="row" style="padding:2px;">' +
				 			'<div class="pull-left"><input style="margin: 2px;" data-value="' + circType.type + '" type="radio" name="circuitTypeRadio">' + circType.type + '</div>' +
				 			'<div class="pull-right" style="width:13px;height:13px;margin-top:5px;background-color:' + circType.color + ';"></div>' +
				 		'</div>'; 
			}
			html += '</form>';
			html += '<div class="pull-left" style="margin-right:-6px;"><button id="resetCircType" class="btn btn-default btn-sm">' + localize("Reset") + '</button></div>';
			html += '<div class="pull-right" style="margin-right:-6px;"><button id="cancelCircType" class="btn btn-default btn-sm">' + localize("Cancel") + '</button></div>';
			html += '<div class="pull-right" style="margin-right:-6px;"><button id="selectCircType" class="btn btn-default btn-sm">' + localize("Select") + '</button></div>';
			$("#circTypeList").html(html);
        };
    	
    	/**
    	 * Draw circuit types selections in a popover 
    	 */
    	WiresCircuitTypesMgr.prototype.drawPopoverList = function() {
			var html = '<form style="margin: 0 7px 5px 7px;">';
			for(var key in this.wiringDiagram.circuitTypes) {
				var circType = this.wiringDiagram.circuitTypes[key];
				html += '<div class="row" style="padding:2px;">' +
				 			'<div class="pull-left"><input style="margin: 2px;" data-value="' + circType.type + '" type="radio" name="circuitTypeRadio">' + circType.type + '</div>' +
				 			'<div class="pull-right" style="width:13px;height:13px;margin-top:5px;background-color:' + circType.color + ';"></div>' +
				 		'</div>'; 
			}
			html += '</form>';
			html += '<div class="pull-left" style="margin-bottom: 6px; margin-right:-6px;"><button id="popoverResetCircType" class="btn btn-default btn-sm">' + localize("Reset") + '</button></div>';
			html += '<div class="pull-right" style="margin-bottom: 6px; margin-right:-6px;"><button id="popoverCancelCircType" class="btn btn-default btn-sm">' + localize("Cancel") + '</button></div>';
			html += '<div class="pull-right" style="margin-bottom: 6px; margin-right:-6px;"><button id="popoverSelectCircType" class="btn btn-default btn-sm">' + localize("Select") + '</button></div>';
			$("#circTypeListPopover").html(html);
        };
    	
    	/**
         * Save circuit type definitions done to the list and apply changes
         */
    	WiresCircuitTypesMgr.prototype.saveCircTypesAssignments = function() {
			this.circuitTypesMgr.saveCircuitTypesAssignments(this.wiringDiagram.slideAlbumData['title'], this.wiringDiagram.slideAlbumData['customer'], this.wiringDiagram.circuitTypesToWires);
			this.applyChanges();
        };
    	
    	 /**
         * Apply changes to the list to the wiring diagram
         */
        WiresCircuitTypesMgr.prototype.applyChanges = function() {
        	var wireSegments = this.wiringDiagram.wireSegments;
        	for (var key in wireSegments) {
        		var wire = wireSegments[key];
        		if(wire.circuitType != null) {
        			wire.updateCircuitType(this.wiringDiagram.circuitTypes[wire.circuitType.type]);
        		} else {
        			wire.updateCircuitType(null);
        		}
     		}        	
        };


