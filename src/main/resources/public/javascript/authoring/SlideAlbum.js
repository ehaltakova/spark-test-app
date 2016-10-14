/**
* Slide Album Client Manager.
* 
* Handles open and close of a slide album:
* - access REST API to retrieve slide album data;
* - load and embed slide album SVG diagram;
* - handles readonly/editable mode display;
* - handles lock/unlock of the slide album.
*/
	
	/**
	 * SlideAlbumMgr constructor
	 */
	SlideAlbumMgr = function () {
		
		this.restApiUtil = new RESTAPIUtil();
		
		this.readOnly = false;
		
		this.slideAlbumData = null;
		this.animationData = null;
		this.circuitTypesData = null;
		this.svgFileURL = null;
		this.svgFileContent = null;
		
		this.slideAlbum = null; // ref to SlideAlbum child object
	};

	/** 
	 * SlideAlbumMgr methods
	 */

    	/**
    	 * Call REST API when a slide album is opened to retrieve the album data.
    	 * Slide album will be locked if opened in editable mode (check readOnly argument).
    	 * @param title string Slide album title
    	 * @param customer string Slide album customer
    	 * @param readOnly boolean True if slide album is opened in readonly mode, false if it is opened in editable mode
    	 */
        SlideAlbumMgr.prototype.open = function (title, customer, readOnly) {    
        	
        	this.readOnly = readOnly == "true" ? true : false;
        	
        	// call REST API to retrieve slide album data
        	var url = API_BASE_URL + '/api/openSlideAlbum';
    		var type = 'POST';	 
    		var data = {'title': title, 'customer': customer, 'readOnly': this.readOnly};	
    		var callback = (function(response) {   
    			this.load(response);
    		}).bind(this);
    		this.restApiUtil.execute(url, type, data, callback, true);	   	
        };
        
        /**
    	 * Load slide album:
    	 * - retrive and store all the information about the slide album from REST API:
    	 * 		- slide album properties (title, customer, locked, etc.);
    	 * 		- wiring diagram file (URL/content);
    	 * 		- animation data;
    	 * 		- circuit types data.
    	 * - load and embed SVG drawing in the page;
    	 * - take care about readonly/editable mode;
    	 * - take care about lock/unlock.
    	 * @param data object Slide album complete data
    	 */
        SlideAlbumMgr.prototype.load = function(data) {
        	        	
        	// store data
        	this.slideAlbumData = data['slideAlbum'];
			this.animationData = data['animationData'];
			this.circuitTypesData = data['circuitTypesData'];
			this.svgFileURL = data['svgFileURL'];
			this.svgFileContent = data['svgFileContent'];
			
			// load and embed SVG diagram
			this.loadDiagram(); 
			
			// if slide album is locked by another user it should be opened and displayed in readOnly mode 
			if((this.slideAlbumData['locked'] != null) && (this.slideAlbumData['locked'] != sessionMgr.getUserContext()['username'])) {
				this.readOnly = true;
				bootbox.alert(localize("Warning! This slide album is opened by <b> {_username} </b>. <br> You are viewing it in read-only mode.", {_username:this.slideAlbumData['locked']}));
			} 						
			if(this.readOnly) {
				this.displayInReadOnlyMode();
			} 
			
			// handle slide album close
			this.onClose();
        };
             
        /**
         * Get the svg drawing file/content and embed it in the page.
         * On diagram load initialize a Slide Album object.
         */
        SlideAlbumMgr.prototype.loadDiagram = function() {	
			if(this.svgFileURL != null) {
				this.embedDiagram(this.svgFileURL);
			} else if(this.svgFileContent != null) {
				this.embedDiagramContent(this.svgFileContent);
			}
    	};
    	
    	/**
    	 * Embed SVG file in a page. 
    	 * On SVG load initialize a Slide Album object.
    	 * @param url string SVG file location URL
    	 */
        SlideAlbumMgr.prototype.embedDiagram = function(url) {   
			// embed the svg
			$("#svgContainer").html('<object id="svgObject" type="image/svg+xml" data="' + url + '"></object>');	
    		 $("#svgObject").on("load", (function(){
    			 var svg = new SVG();
    			 svg.load();
    			 // NOTE: we need to do this here because SlideAlbum operates with the SVG drawing.
    			 var slideAlbumObj = new SlideAlbum(svg, this.readOnly, this.animationData, this.slideAlbumData, this.circuitTypesData, this.svgFileURL);
    			 slideAlbumObj.init();
    			 this.slideAlbum = slideAlbumObj;
		    }).bind(this));
    	};
    	
    	/**
    	 * Embed SVG file content in a page.
    	 * @param content string SVG file content as string
    	 */
    	SlideAlbumMgr.prototype.embedDiagramContent = function(content) {                                      
    		var s = Snap("#svgContainer");                                                       
    	    var f = Snap.parse(content, function() {});                                               
    	    s.append(f) ;
    	};
    	
    	/**
    	 * Handle closing of a slide album (leaving the page/app/browser).
    	 * If in editable mode release slide album lock on close.
    	 * Check for unsaved changes and warn user for them.
    	 */
    	SlideAlbumMgr.prototype.onClose = function() {
    		$(window).bind('beforeunload', (function() {
				if(this.readOnly) {
	    			// nothing
	    		} else {
	    			// warn user for unsaved changes (if any) and release slide album lock
				    if(this.slideAlbum.isDirty || this.slideAlbum.circuitTypesMgr.isDirty) {
				    	this.releaseLock(this.slideAlbumData['title'], this.slideAlbumData['customer']); // release no matter if user stays or not - ugly hack but otherwise the slide album will stay locked
				        return localize("You have unsaved changes to the slide album.\nAre you sure you want to continue?");
				    } else {
			  	      	this.releaseLock(this.slideAlbumData['title'], this.slideAlbumData['customer']); // release lock
		  	        }
	    		}
			}).bind(this));
    	};
    	
    	/**
    	 * Release slide album lock.
    	 * @param title string Slide album title
    	 * @param customer string Slide album customer
    	 */
    	SlideAlbumMgr.prototype.releaseLock = function(title, customer) {
    		var url = API_BASE_URL + '/api/releaseSlideAlbumLock';
    		var type = 'POST';	 
    		var data = {'title': title, 'customer': customer}; // request data
    		var cb = function(response) {
    			// nothing
    		};
    		this.restApiUtil.executeSync(url, type, data, cb, true);
    	};
    	
    	/**
    	 * Display slide album in readonly mode:
    	 * - apply different coloring scheme;
    	 * - disable any sensitive actions which change the slide album.
    	 */
    	SlideAlbumMgr.prototype.displayInReadOnlyMode = function() {
    		$(".slide-album-page-link").html(this.slideAlbumData['title'] + " <em>(Read-Only)</em>");
			$(".slide-album-page-link").parent().addClass("locked");
			this.disableAnimationTab();
			this.disableCircuitTypesTab();
			this.disableFilesTab();
    	};
    	
    	/**
    	 * Display Animation tab in readonly mode.
    	 */
    	SlideAlbumMgr.prototype.disableAnimationTab = function() {
    		$("#sliderControlPanelHeading").parent().removeClass("panel-primary");
			$("#sliderControlPanelHeading").parent().addClass("panel-danger");
    		$("#addSlide").attr('disabled', true);
			$("#insertSlide").attr('disabled', true);
			$("#deleteSlide").attr('disabled', true);
			$("#saveSlides").attr('disabled', true);
			$("#circuitTitle").attr('disabled', true);
			$("#stepTitle").attr('disabled', true);
			$("#stepDetails").attr('disabled', true);			
    	};
    	
    	/**
    	 * Display Circuit Types tab in readonly mode.
    	 */
    	SlideAlbumMgr.prototype.disableCircuitTypesTab = function() {    		
    		$("#assignCircTypesPanelHeading").parent().removeClass("panel-primary");
			$("#assignCircTypesPanelHeading").parent().addClass("panel-danger");
			$("#circTypesListPanelHeading").parent().removeClass("panel-primary");
			$("#circTypesListPanelHeading").parent().addClass("panel-danger");	
    		$("#saveCircTypesData").attr("disabled", true);    		
    		$("#addCircType").attr("disabled", true);  
    	};
    	
    	/**
    	 * Display Files tab in readonly mode.
    	 */
    	SlideAlbumMgr.prototype.disableFilesTab = function() {
    		$("#importFilesPanelHeading").parent().removeClass("panel-primary");
			$("#importFilesPanelHeading").parent().addClass("panel-danger");
			$("#downloadFilesPanelHeading").parent().removeClass("panel-primary");
			$("#downloadFilesPanelHeading").parent().addClass("panel-danger");
    	};

/**
 * Slide Album.
 * 
 * Handles all slide album related functionality and works with the loaded svg diagram (data and svg provided by SlideAlbumMgr):
 * - check svg diagram for issues, check svg labeling, apply necessary labeling;
 * - animations management: set up animation actors and UI objects;
 * - animation slides management: manages slides CRUD;
 * - circuit types management: circuit types list definition and assignment of circuit types to wires;
 * - slide album files management: import, delete, download slide album files.
 * 
 * A slide album is a collection of animations applied to a wiring diagram.
 * Object of animation in the diagram are the following objects (actors) and their state:
 * - wiring segments/circuits
 * - switches
 * - voltage ballons
 * A slide album consists of slides.
 * Each slide consists of combination of animated actors - energized circuits, switches turned on a certain position, voltage ballons with certain values.
 * Wire actors have circuit types being manageable by the application.
 * Slide album animations are stored in XML format, slide album circuit types definitions are stored in a JSON file.
 * Slide album files could be exported to be used in a viewer application.
 */

 /* SALSSA2 ACTORS DEFINITION & LABELING RULES:
 * 
 * 0) Actors are defined in layers with id^="layer_"
 * 
 * 1) Switch
 * - all switch elements should be defined in the SVG under parent layers with id^=SWITCHES_LAYER, i.e. with id starting with the string SWITCHES_LAYER ("layer_switches")
 * - a switch element is a direct child of one of the layers having id starting with "layer_switches" 
 * - every switch element is defined by a single <g> element having children of type <g> representing the switch positions
 * - switch position is a direct child of the switch element
 * - a switch element can have ONLY switch positions as direct children, 
 *   any other graphic information should be exposed outside the switch layer element
 * - example of not labeled switch:
 *   <g> <!-- switch -->
 * 	   <g>...</g> <!-- switch position -->
 *     <g>...</g> <!-- switch position -->
 *   </g>
 * - LABELING: 
 * 	 - switch element: id = SWITCH_PREFIX + LABEL_DELIMITER + <switch_seq_number> (e.g. "switch_x005F_1")
 * 	 - switch position element: id = <switch_element_label> + LABEL_DELIMITER + <switch_pos_seq_number> (e.g. "switch_x005F_1_x005F_1")
 *   - example of labeled switch:
 *     <g id="switch_x005F_1"> <!-- switch 1 -->
 * 	    <g id="switch_x005F_1_x005F_1">...</g> <!-- switch position 1 -->
 *      <g id="switch_x005F_1_x005F_2">...</g> <!-- switch position 2 -->
 *     </g>
 *   
 * 2) DCBalloon
 * - all balloons elements should be defined in the SVG under parent layers with id^=DCBALLOOONS_LAYER, i.e. with id starting with the string DCBALLOOONS_LAYER ("layer_dcballoons")
 * - a balloon element is a direct child of one of the layers having id starting with "layer_dcballoons"
 * - every balloon element is defined by a single <g> element
 * - a balloon element should have a child of type <text> containing the text value of the balloon 
 * - <text> child element could have 0, 1 or more <tspan> children
 * - some of the balloon tetx nodes should contain the slug text = "I"
 * - example of not labeled balloon:
 *   <g> <!-- balloon -->
 * 	   ...
 *     <text><tspan>I</tspan></text> <!-- text node with slug text -->
 *   </g>
 * - LABELING: 
 * 	 - balloon element id = DCBALLOOON_PREFIX + LABEL_DELIMITER + <seq_number> (e.g. "dcballoon_x005F_1")
 * 	 - example of labeled balloon:
 *     <g id="dcballoon_x005F_1"> <!-- balloon -->
 * 	     ...
 *       <text><tspan>I</tspan></text>
 *     </g>
 *
 * 3) Wire Segment
 * - all wire elements should be defined in the SVG under parent layers with id^=CIRCUITS_LAYER, i.e. the ids of the parent layers should start with the string CIRCUITS_LAYER ("layer_wires")
 * - a wire element is a direct child of one of the layers having id starting with "layer_wires"
 * - every wire element is defined by a <path>, <line> or <polyline> elements
 * - a logical wire can conists of more than one element but all the elements constructing the wire are independent by definition, 
 *   their labels are not related by a pattern   
 * - LABELING: 
 * 	 - wire segment element id = CIRCUIT_PREFIX  + LABEL_DELIMITER + <seq_number> (e.g. "circuit_x005F_1")
 *   - example of labeled wire segments:
 *     <path id="circuit_x005F_1"/>
 *     <path id="circuit_x005F_2"/>
 *     <line id="circuit_x005F_3"/>
 *     <polyline id="circuit_x005F_4"/>
 * - ANIMATION:
 * 	 - wire should be labeled in order to be enabled for animation
 *   - wire labels are assigned only automatically by the SALSSA2 application
 *   - wire should have circuit type assigned to it in order to be enabled for animation
 *   - wire-circuit type mapping is defined in an external file by SALSSA2 user
 */
	
	/**
	 * Slide Album constructor
	 */
	SlideAlbum = function (svgHandler, readonly, animationData, slideAlbumData, circuitTypesData, svgFileURL) {
		
		this.svgHanlder = svgHandler;
		this.svg = svgHandler.svg;
		this.readonly = readonly;

		this.slideAlbumData = slideAlbumData;
		this.animationData = animationData;
		this.svgFileURL = svgFileURL;
		this.circuitTypesData = circuitTypesData;
		this.circuitTypesToWires = (this.circuitTypesData != null && this.circuitTypesData['circuitTypesToWires'] != null && this.circuitTypesData['circuitTypesToWires'].length!=0) ? this.circuitTypesData['circuitTypesToWires'] : {};
		
		this.wiringDiagram = null;		
		
		this.isDirty = false; // animation/circuit type changes	
		this.isSvgDirty = false; // svg labeling changes

		this.animationsMgr = null; // Animations tab
		this.circuitTypesMgr = null; // Circuit Types tab
		this.filesMgr = null; // Files tab
	};

	/** 
	 * Slide Album methods
	 */

    	/**
    	 * Initialize and set up a slide album (new or existing) ready for authoring.
    	 */
    	SlideAlbum.prototype.init = function() {
    		    		
    		// check svg for actors without labels and apply automatic labeling if necessary 
    		this.labelActors();
    		// save label changes if any and notify the user
    		if(!this.readonly && this.isSvgDirty) {
				bootbox.alert(localize("Actors with no labels are found. SALSSA2 will label them automatically and save the changes."));
    			this.saveDiagramLabelling();
    		}
//    		var urlencoded = encodeURIComponent(this.slideAlbumData.customer);
//    		var escaped = urlencoded.replace('%', '%25');

    		//../workspaces/bo%25C3%25AEte/fran%25C3%25A7ais/fran%25C3%25A7ais.svg
    		
    		var url = this.svgFileURL;
    		var arr = url.split('/');
    		var encoded_customer_name = arr[arr.length - 3];
    		this.svgHanlder.loadCss(config['workspace_folder_path'] + "/" + encoded_customer_name); // NOTE: css is dynamically loaded to the SVG and should not be saved in the file, so we need to do this here!

    		// Animated Wiring Diagram 
    		this.wiringDiagram = new AnimatedWiringDiagram(this.svgHanlder, this.animationData, this.slideAlbumData, this.circuitTypesData, true, this);
    		this.wiringDiagram.init();
    		
    		// Animations Manager (Animations tab)
    		this.animationsMgr = new AnimationsMgr(this);
    		this.animationsMgr.initialize();
			
			// Circuit Types Manager (Circuit Types Tab)
			this.circuitTypesMgr = new CircuitTypesMgr(this);
			this.circuitTypesMgr.initialize();
			
			// Files Manager (Files Tab)
			this.filesMgr = new FilesMgr(this);
			this.filesMgr.initialize();
						
			// check data consistency regarding circuit types assignments to wire segments 
    		this.checkCircuitTypeDataConsistency();
    	};
     	
     	/**
     	 * Find and label actors having no labels.
     	 * Note: this is done only for the non-legacy SVGs
     	 */
     	SlideAlbum.prototype.labelActors = function() {
     	    // label wires
     		// Note; wires = path, line or polyline children of layers with ids starting with the string CIRCUITS_LAYER (e.g. layer_wires)
     		var wiresLayersChildren = [];
     		var wireBalloonsGroups = [];
     		this.svg.selectAll("g[id^='"+CIRCUITS_LAYER+"']").forEach(function(wiresLayer) { // collect wires from all wires layers
     			if(wiresLayer != null) {
     				wiresLayer.selectAll("g").forEach(function (element) {
     					if(element.parent() == wiresLayer) {
     						var balloonElement = element.select("g");
     						var wireElement = element.select("path, line, polyline");
     						wireBalloonsGroups.push(new WrieBaloonGroup(wireElement, balloonElement));
     						wiresLayersChildren.push(wireElement);
     					}
     				});
     				wiresLayer.selectAll("path, line, polyline").forEach(function (element) {
     					if(element.parent() == wiresLayer) {
     						wiresLayersChildren.push(element);
     					}
     				});
     			}
     		});

     		if(wiresLayersChildren.length >= 1) {
         		this.labelWires(wiresLayersChildren, wireBalloonsGroups); // send wires from all wires layers for labeling
     		} else {
     			this.isLegacy = true; // the old format => no automatic labeling!
     			return;
     		}
     		
     		// label switches 
     		// Note; switches = g children of layers with ids starting with the string SWITCHES_LAYER (e.g. layer_switches)
     		var switchesLayersChildren = [];
     		this.svg.selectAll("g[id^='"+SWITCHES_LAYER+"']").forEach(function(switchesLayer) { 
     			if(switchesLayer != null) {
     				switchesLayer.selectAll("g").forEach(function(element) {
     					if(element.parent().attr("id") != null && element.parent().attr("id").substring(0, SWITCHES_LAYER.length) == SWITCHES_LAYER) {
         					switchesLayersChildren.push(element);
     					}
     				});
     			}
     		});
     		if(switchesLayersChildren.length >= 1) {
         		this.labelSwitches(switchesLayersChildren); 
     		} 
     		
     		// label dcballoons
     		// Note: balloons = g children of layers with ids starting with the string DCBALLOOONS_LAYER (e.g. layer_dcballons)
     		var balloonsLayersChildren = [];
     		this.svg.selectAll("g[id^='"+DCBALLOOONS_LAYER+"']").forEach(function(balloonsLayer) { 
     			if(balloonsLayer != null) {
     				balloonsLayer.selectAll("g").forEach(function(element) {
     					if(element.parent().attr("id") != null && element.parent().attr("id").substring(0, DCBALLOOONS_LAYER.length) == DCBALLOOONS_LAYER) { // only direct children
     						balloonsLayersChildren.push(element);
     					}
     				});
     			}
     		});
     		if(balloonsLayersChildren.length >= 1) {
     			this.labelBalloons(balloonsLayersChildren);  
     		}      		
     	};
     	 
     	/**
     	 * Label wires having no labels.
     	 * Do the same for the wire color blind ballons (if any).
     	 * @param wiresLayersChildren array Path|Line|Polyline elements children of the wires layers groups
     	 * @param wireBalloonsGroups array Collection of WireBalloonGroup objetcs representing a wire element-balloon element mapping
     	 * Note: labeling of the wires having no labels should start from the max wire label index found (if the SVG is partially labeled) 
     	 */
     	SlideAlbum.prototype.labelWires = function(wiresLayersChildren, wireBalloonsGroups) {
     		var wiresWithNoLabel = []; // collect all the wires with no labels
 			var maxIndex = 0; // max wire label index found 
 			for(var j=0; j<wiresLayersChildren.length; j++) {
 				var wire = wiresLayersChildren[j];
	 			if(wire.type == "path" || wire.type == "line" || wire.type == "polyline")	{ 
 					if(wire.attr("id") == null) { // label only if no label is present
 	 					wiresWithNoLabel.push(wire);
 	 				} else {
 	 					// wire is labeled but check for balloon added to it and label it if it has no label
 	 	 				var balloonElement = this.getBalloonByWireID(wire.attr("id"), wireBalloonsGroups);
 	 	 				if(balloonElement != null && balloonElement.attr("id") == null) {
 	 	 					balloonElement.attr("id", wire.attr("id").replace("circuit_", "cb_")); // label the wire balloon 
 	 	 				}
 	     				var labelIndex = wire.attr('id').split("_").pop();
 	     				if(maxIndex < parseInt(labelIndex)) {
 	     					maxIndex = parseInt(labelIndex);
 	     				}
 	 				}
 				}
 			}
 			for(var i=0; i<wiresWithNoLabel.length; i++) { // label the wires with no labels starting from maxIndex + 1
 				maxIndex++;
 				var wireLabel = CIRCUIT_PREFIX + LABEL_DELIMITER + maxIndex; // the circuit type is no more part of the wire label!
 				wiresWithNoLabel[i].attr("id", wireLabel); 
 				// check for color blind balloon 
 				var balloonElement = this.getBalloonByWireID(wireLabel, wireBalloonsGroups);
 				if(balloonElement != null) {
 					balloonElement.attr("id", wireLabel.replace("circuit_", "cb_")); // label the wire balloon 
 				}
 				this.isSvgDirty = true;
 			}
 			
 			// NOTE: populate diagram color-blind balloons map
 			if(wireBalloonsGroups  == null) {
 				for(var i=0; i<wireBalloonsGroups.length; i++) {
 	    			var wireBalloonGroup = wireBalloonsGroups[i];
 	    			var wireId = wireBalloonGroup.wire.attr("id"); 
 	    			this.wiringDiagram.balloonToWires[wireId] = wireBalloonGroup.balloon;
 	    		}
     		}
     	};
     	
     	/**
     	 * Label switches having no labels.
     	 * Note: labeling of the switches having no labels should start from the max switch label index found (if the SVG is partially labeled) 
     	 */
     	SlideAlbum.prototype.labelSwitches = function(switchesLayersChildren) {
     		var switchesWithNoLabel = []; // collect all the switches with no labels
 			var maxIndex = 0; // max switch label index found 
 			for(var i=0; i<switchesLayersChildren.length; i++) {
 				var switchElem = switchesLayersChildren[i];
 				if(switchElem.attr("id") == null) {
 					switchesWithNoLabel.push(switchElem); // parent is no labeled, so we don't look for the child positions now
 				} else {
 					var labelIndex = switchElem.attr("id").split("_").pop();
 					if(maxIndex < parseInt(labelIndex)) {
 	     				maxIndex = parseInt(labelIndex);
 	     			}
 					// label the positions - the same as the switches
 					var switchPosWithNoLabels = [];
 					var switchPosMaxIndex = 0;
 					var switchPositions = switchElem.selectAll("g").forEach(function(switchPosElement) { // label swtich positions
 						if(switchPosElement.parent().attr("id") == switchElem.attr("id")) {
 							if(switchPosElement.attr("id") == null) {
 								switchPosWithNoLabels.push(switchPosElement);
 							} else {
 								var switchPosLabelIndex = switchPosElement.attr("id").split("_").pop();
 								if(switchPosMaxIndex < parseInt(switchPosLabelIndex)) {
 									switchPosMaxIndex = parseInt(switchPosLabelIndex);
 			 	   				}
 							}
 						}
 					});	
 					// label the switchPositions with no labels starting from switchPosMaxIndex + 1
 					for(var j=0; j<switchPosWithNoLabels.length; j++) {
 						switchPosMaxIndex++;
 						var switchPosLabel = switchElem.attr("id") + LABEL_DELIMITER + switchPosMaxIndex;
 						switchPosWithNoLabels[j].attr("id", switchPosLabel);
 						this.isSvgDirty = true;
 					}	
 				}
 			};  
     		// label the switches with no labels starting from maxIndex + 1
     		for(var i=0; i<switchesWithNoLabel.length; i++) { 
     			maxIndex++;
     			var switchElem = switchesWithNoLabel[i];
     			var switchLabel = SWITCH_PREFIX + LABEL_DELIMITER + maxIndex;
				switchElem.attr("id", switchLabel);
				// label the positions - the same as the switches
				var switchPosWithNoLabels = [];
				var switchPositions = switchElem.selectAll("g").forEach(function(switchPosElement) { // label swtich positions
					if(switchPosElement.parent().attr("id") == switchLabel) {
						switchPosWithNoLabels.push(switchPosElement);
					}
				});	
				// label all of the switchPositions no matter if they have labels or not
				var switchPosIndex = 0;
				for(var j=0; j<switchPosWithNoLabels.length; j++) {
					switchPosIndex++;
					var switchPosLabel = switchLabel + LABEL_DELIMITER + switchPosIndex;
					switchPosWithNoLabels[j].attr("id", switchPosLabel);
					this.isSvgDirty = true;
				}	
	 		}
     	};
     	
     	/**
     	 * Label balloons having no labels.
     	 * Note: labeling of the balloons having no labels should start from the max balloon label index found (if the SVG is partially labeled) 
     	 */
     	SlideAlbum.prototype.labelBalloons = function(balloonsLayersChildren) {
     		var balloonsWithNoLabel = []; // collect all the balloons with no labels
 			var maxIndex = 0; // max balloon label index found 
 			for(var i=0; i<balloonsLayersChildren.length; i++) {
 				var balloon = balloonsLayersChildren[i]; 			
				if(balloon.attr("id") == null) {
 					balloonsWithNoLabel.push(balloon);
 				} else {
 					var labelIndex = balloon.attr('id').split("_").pop();
 	   				if(maxIndex < parseInt(labelIndex)) {
 	   					maxIndex = parseInt(labelIndex);
 	   				}
 				}
 			}
     		// label the balloons with no labels starting from maxIndex + 1
     		for(var i=0; i<balloonsWithNoLabel.length; i++) { 
 				maxIndex++;
 				var balloonLabel = DCBALLOOON_PREFIX + LABEL_DELIMITER + maxIndex;
 				balloonsWithNoLabel[i].attr("id", balloonLabel);
 				this.isSvgDirty = true;
 			}				
     	};
     	
     	/**
     	 * Save the changes to the wiring diagram SVG file done because of the actors labeling.
     	 */
     	SlideAlbum.prototype.saveDiagramLabelling = function() {
     		
     		var restApiUtil = new RESTAPIUtil();
     		
     		// get svg xml content from DOM
     		var xmlDoc = document.getElementById("svgObject").contentDocument;
    		var xmlStr = (new XMLSerializer()).serializeToString(xmlDoc);
    		
    		// call save service
     		var self = this;
    	    var url = API_BASE_URL + '/api/svg/save';
    	    var type = 'POST';	 
    	    var data = {'title': this.slideAlbumData['title'], 'customer': this.slideAlbumData['customer'], 'filename': this.slideAlbumData.svg, 'xml': xmlStr};
    	    var callback = function(resp) { 
    	    };
    	    
    	    var restApiMgr = this;
    		$.ajax({
    			type: type,
    			contentType: "application/x-www-form-urlencoded",
    			url: url,     
    			data: JSON.stringify(data),
    			success: function(response) {
    				callback(response);
    			},
    			error: function(response) {
    	        	var errorMsg = response.status + " " + response.statusText + ": " + localize("An internal error occured. Please contact your system administrator.");
    	        	if(response.status == 401) {
    	        		errorMsg = response.status + " " + response.statusText + ": " + localize("Invalid credentials. Please, try again.");
    	        	} else if(response.status == 403) {
    	        		window.location.href = APP_BASE_URL + "/error";
    				}
    	        	displayUserNotification('danger', [errorMsg]);
    			},
    			dataType: "json"               
    		});
     	};
     	
     	/**
     	 * Find wire baloon element (if any) by wire id.
     	 * @param wireID string
     	 * @param balloonsToWires map
     	 * @returns Snap element Balloon element
     	 */
     	SlideAlbum.prototype.getBalloonByWireID = function(wireID, balloonsToWires) {
    		for(var i=0; i<balloonsToWires.length; i++) {
    			var wireBalloonGroup = balloonsToWires[i];
    			if(wireBalloonGroup.wire.attr("id") == wireID) {
    				return balloonsToWires[i].balloon;
    			}
    		}
    		return null;
    	};
    	
    	/**
    	 * Show wire color-blind labels (if any).
    	 */
    	SlideAlbum.prototype.showWireLabels = function() {
     		for(var wireID in this.wiringDiagram.wireSegmentLabels) {
				this.wiringDiagram.wireSegmentLabels[wireID].show();
			}
     	};
     	
     	/**
     	 * Hide wire color-blind labels (if any).
     	 */
     	SlideAlbum.prototype.hideWireLabels = function() {
     		for(var wireID in this.wiringDiagram.wireSegmentLabels) {
				this.wiringDiagram.wireSegmentLabels[wireID].hide();
			}
     	};
     	
     	/**
    	 * Do data consistency check.
    	 * Check if there are wires with assigned circuit types which are missing from the diagram.
    	 * Check if there are circuit types assigned to wires which are not present in the circuit types list.
    	 * Display an error report if inconsistencies are found.
    	 */
    	SlideAlbum.prototype.checkCircuitTypeDataConsistency = function() {
    		var wrongWiresMessages = [];
    		var wrongCircTypeMessages = [];
    		for(key in this.wiringDiagram.circuitTypesToWires) {
    			// check for such a wire
    			if(this.wiringDiagram.wireSegments[key] == null) {
    				wrongWiresMessages.push(localize("Wire segment with id <b> {key} </b> of circuit type {type} does not exist in the diagram.", {key: key, type: this.wiringDiagram.circuitTypesToWires[key]}) + " \n");
    			}
    			// check for such a circuit type
    			if(this.wiringDiagram.circuitTypes[this.wiringDiagram.circuitTypesToWires[key]] == null) {
    				wrongCircTypeMessages.push(localize("Circuit type <b> {_circType} </b> assigned to wire segment with id <b> {id} </b> does not exist for this slide album.", {_circType: this.wiringDiagram.circuitTypesToWires[key], id: key}) +" \n");
    			}
    		}
    		if(wrongWiresMessages.length > 0 || wrongCircTypeMessages.length > 0) {
        		var inconsistencyReport = [localize("<b> WARNING! CIRCUIT TYPES-WIRES MAPPING INCONSISTENCY REPORT: </b>") + "\n"];
    			inconsistencyReport = inconsistencyReport.concat(wrongWiresMessages).concat(wrongCircTypeMessages);
    	    	displayUserNotification('warning', inconsistencyReport);
     		}
    	};
    

/**
 * 
 * WireBalloonGroup.
 * 
 */
	WrieBaloonGroup = function (wire, balloon) {
		this.wire = wire;
		this.balloon = balloon;		
	};

