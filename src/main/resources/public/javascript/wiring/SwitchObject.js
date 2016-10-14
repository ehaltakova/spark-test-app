/**
 * Switch UI.
 * This is the graphical representation of the switch in the SVG drawing.
 * 
 * Example:
 * <g id="switch_x005F_1"> <!-- switch parent element -->
 *		<g>
 *		...
 *		</g>
 *		<g id="switch_x005F_1_x005F_2"> <!-- switch position element -->
 *			<line fill="none" stroke="#000000" stroke-width="0.5" x1="362.551" y1="141.979" x2="371.176" y2="135.197"/>
 *		</g>
 *		<g id="switch_x005F_1_x005F_1" display="none"> <!-- switch position element -->
 *			<line display="inline" fill="none" stroke="#000000" stroke-width="0.5" x1="362.551" y1="141.979" x2="371.177" y2="141.979"/>
 *		</g>
 * </g>
 * Note: the turned on position is the one which is visible. The positions in rest are hidden and have style = display:none.
 * A switch position element could be represented by a group of elements which hadnles mouse events togeher. 
 *
 * The number of a current position (turned on/off) is contained in the switch label string (the last digit):
 * <g id="switch_x005F_5"> Node for the whole switch - switch #5
 * <g id="switch_x005F_5_x005F_2" display="none"> Node containing one of the positions - position 2 of sitch #5
 */
(function ($) { 
	
	/**
	 * SwitchObject constructor.
	 * @param svg Snap object The DOM representation of the SVG drawing.
	 * @param element Snap object The XML node representing the switch in the SVG drawing
	 * @param wiringDiagram AnimatedWiringDiagram object The wiring diagram which the switch belongs to
	 */
	$.SwitchObject = function (svg, element, wiringDiagram) {
		
		this.wiringDiagram = wiringDiagram;
		this.svg = svg;
		this.element = element;
		this.name = element.attr("id");
		this.id = element.attr("id");
		
		this.isAuthoring = wiringDiagram.isAuthoring; // True if object is used in SALSSA application (authoring mode), False if it is used in the AWD viewer
		this.appContext = wiringDiagram.appContext; // Context in which the object exists (SlideAlbum in the SALSSA context, WireDiagram in the context of the AWD viewer)
		
		this.positions = [];
		this.positionsCount = 0;
		this.defaultValue = null;
		
		this.highlightGroupId = WIRING_ANIMATION_CONSTANTS['switch_group_highlight_id']; // id of the fake switch group element created on the fly to contain the positions elements to be highlighted/selected
		this.highlightGroupElement = this.createSwitchHighlightElement(); // the fake switch group element itself
		
		this.assignPositions(); // init switch positions		
		this.setDefaultPosition(); // set the default value, i.e. the index of the switch position being turned on by default and turn it on
		if(this.isAuthoring) {
			this.displayAllPositions(); // make each position visible and ready for selection
		}
	};

	/**
	 * Switch Object methods
	 */
    $.SwitchObject.prototype = {
    		
    	/**
    	 * Collect switch positions and create corresponding SwitchPositionObject objects for them.
    	 */
    	assignPositions: function() {
    		this.element.selectAll("g").forEach((function(positionElem) {
    			if(positionElem.attr("id") != null) { // && positionElem.attr("id").indexOf(self.id) == 0 child position elements should have label, starting with the parent switch label id - no, we change this
    				this.positionsCount++;
        			this.positions.push(new SwitchPositionObject(positionElem, this));
    			}
    		}).bind(this));
    	},
    	
    	/**
    	 * Find the switch position being turned on at current moment.
    	 * @return SwitchPositionObject The switch position object being turned on or null
    	 */
    	getSelectedPosition: function() {
    		var switchPositionObj = null;
    		for (var i = 0; i < this.positionsCount; i++) {
    			switchPositionObj = this.positions[i]
    			if (switchPositionObj.selected == true) {
    				return switchPositionObj;
    			}
    		}
    		return null;
    	},
    	
    	/**
    	 * Get the number/index of the switch position being turned on.
    	 * @returns the number of the selected switch position
    	 */
    	getSelectedPositionValue: function() {
    		return this.getSelectedPosition().value;
    	},
    	
    	/**
    	 * Turn on a switch position (turn off the rest positions respectively).
    	 * @param value string The number of the switch position to be selected
    	 * @param isUserSelection boolean True if user has manually selected a switch position, false if it is set automatically by the application (when loading slide/animation)
    	 */
    	setSelectedPositionValue: function(value, isUserSelection) {
    		
    		var positionNotFound = true;
    		
    		if(value == "none")
    			return;
    		
    		// find the switch position element corresponding to the value index and highlight it, turn of the other positions
    		for (var i = 0; i < this.positionsCount; i++) {
    			var switchPositionObj = this.positions[i];
    			if (switchPositionObj.value == value) {
    				positionNotFound = false;
    				switchPositionObj.selected = true;
    				if(this.isAuthoring) {
    					// highlight the selected switch position element, i.e. highlight all elements representing the switch position
    					for(var j=0; j<switchPositionObj.highlightPathElements.length; j++) {
            				switchPositionObj.highlightPathElements[j].attr("class", WIRING_ANIMATION_CONSTANTS['switch_position_selected_class']);
    					}
    				} else {
    					switchPositionObj.element.attr("visibility", "visible"); 
    				}
    			} else {
    				switchPositionObj.selected = false;
    				if(this.isAuthoring) {
    					// unhighlight the switch position element, i.e. unhighlight all elements representing the switch position
    					for(var k=0; k<switchPositionObj.highlightPathElements.length; k++) {
            				switchPositionObj.highlightPathElements[k].attr("class", WIRING_ANIMATION_CONSTANTS['switch_position_mouseout_class']);
    					}
    				} else {
    					switchPositionObj.element.attr("visibility", "hidden");
    				}
    			}
    		}
    		
    		if(positionNotFound) {
    			alert(localize("No switch position {_index} found for switch {id}", {_index: value, id: this.id}));
    		} else {
    			
    			if(this.isAuthoring) { // only for authoring mode (SALSSA)
            		
            		// update the context
            		var slideAlbum = this.appContext;
            		var notTheLastSlide = slideAlbum.animationsMgr.currentSlideIndex < slideAlbum.animationsMgr.slides.length;
            		var notTheFirstSlide = slideAlbum.animationsMgr.currentSlideIndex > 1;
            		
                	// display Propagate Changes button if it is authoring mode, the user has selected the new value manually and if this is not the last slide
            		if(isUserSelection && notTheLastSlide) {
            			var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
            			var currentActor = currentSlide.actors[this.id];
            			var copiedActor = new $.Switch(this.id, this.wiringDiagram);
            			copiedActor.position = value;
            			currentSlide.isDirty = true;
            			currentSlide.changes[this.id] = copiedActor; //save the change to be propagated by storing the corresponding actor and its state
            			$("#propagateChanges").show(); // show the button
            		} 
            		// update the corresponding balloon actor if it is in authoring mode and it is not the first slide selected
        			if(notTheFirstSlide) {
        				var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
        				currentSlide.actors[this.id].position = value;     
        			}
    			}
    		}
    	},
    	
    	/**
    	 * Find and set the switch default value, i.e. the index of the switch position being turned on by default.
    	 * Turn on the position.
    	 */
    	setDefaultPosition: function() {
    		// iterate all switch positions and find the one which is not hidden
    		for (var i = 0; i < this.positionsCount; i++) {
    			var switchPositionObj = this.positions[i];
    			if (switchPositionObj.element.attr("display") != "none") {
        			// position is hidden => it is not selected/default
        		}else{		
        			if (this.defaultValue == null) {
        				this.defaultValue = switchPositionObj.value;
        				switchPositionObj.selected = true; // turn on the default position
        				if(this.isAuthoring) {
        					// highlight the default switch position element, i.e. highlight all elements representing the switch position
        					for(var j=0; j<switchPositionObj.highlightPathElements.length; j++) {
                				switchPositionObj.highlightPathElements[j].attr("class", WIRING_ANIMATION_CONSTANTS['switch_position_selected_class']);
        					}
        				} else {
        					switchPositionObj.element.attr("visibility", "visible"); 
        				}
        			}else{
            			alert(localize("Default position for switch {name} is already set!\n Verify that positions are hidden or display attribute is set to \'none\'.", {name: this.name}));
        			}
        		}
    		}
    	},
    		
    	/**
    	 * Make each switch position visible/displayed.
    	 */
    	displayAllPositions: function() {
    		for (var i = 0; i < this.positionsCount; i++) {
        		var switchPositionObj = this.positions[i];
        		if (switchPositionObj.element.attr("display") == "none") {
        			switchPositionObj.element.node.removeAttribute("display");
        			switchPositionObj.element.attr("visibility", "visible");
        		}
    		}
    	},
    	
    	/**
    	 * Create a fake switch group element to capture mouse events.
    	 * Swtich positions fake elements to be highligted/selected should be apended to this group element.
    	 */
    	createSwitchHighlightElement: function() {
        	var highlightGroupId = this.highlightGroupId;
        	var highlightsLayer = this.svg.select("#" + highlightGroupId);
        	if(highlightsLayer == null) { // create if it not existing
        		highlightsLayer = this.svg.g().attr({ 
        			id: highlightGroupId
        		}).attr("pointer-events", "all");
        	}
        	return highlightsLayer;
    	}
    };
}(jQuery));

/**
 * Switch Position UI.
 * Represent a single switch postion to be turned off/on.
 */
	
	/**
	 * Switch Position object constructor.
	 * @param element Snap element The switch position node element
	 * @param parent Snap element The SwitchObject to which the given switch position belong
	 * @returns SwitchPositionObject
	 */
	SwitchPositionObject = function (element, parent) {
		
		this.element = element;
		this.parent = parent;
		this.id = element.attr("id");
		
		this.selected = false;
		this.value = this.getSwitchPositionValue();
		this.highlightPathElements = []; // collection with fake element created on the fly to handle mouse events over the switch position graphic elements (could be more than one!)
		  								 // having the same coordinates as the original switch position node element

		if(this.parent.isAuthoring) {
			// create the fake elements being copy of the switch position grpahic elements to capture mouse events
			this.createSwitchPositionHighlightElements();
		} else {
			if(this.element.attr("display") == "none") {
				this.element.node.removeAttribute("display");
				this.element.attr("visibility", "hidden");
			}
		}
	};

	/**
	 * SwitchPositionObject methods
	 */

    	/**
    	 * Find the switch position value, i.e. the index of the switch position (the last digit in the element label).
    	 * @return strirng The switch position value/index
    	 */
    	SwitchPositionObject.prototype.getSwitchPositionValue = function() {
    		
    		var  value= "";
    		var lastUnderScorePos = this.id.lastIndexOf (WIRING_ANIMATION_CONSTANTS['switch_position_index_delimiter']);
    		if (lastUnderScorePos > -1) {
    			value =  this.id.substring(lastUnderScorePos + 1) + "";
    		}
    		if (value == "") {
    			alert(localize("Illustrator/SVG markup error:  Cannot determine index for Switch position, {id}.\n Naming convention violation.", {id:this.parent.id}));
    		}
    		return value;
        };
        
        /**
         * Create fake switch element and fake switch position child elements in it to capture the mouse events.
         */
        SwitchPositionObject.prototype.createSwitchPositionHighlightElements = function() {
        	        	
        	var penCoords = "";
        	var switchPositionChildElements = this.element.selectAll("path, line, polyline, polygon");
        	var highlightPathElement = null;
        	var highlightPathId = null;
        	var polygonattr = null;
        	var index = 0;
        	var isPolygon = false; 
        	
        	// create fake highlight elements for the graphic elements representing the switch position
        	switchPositionChildElements.forEach((function(elem) {
        		
        		// make the original graphic element non-responsible to mouse events; the fake copy will capture them instead.
        		elem.attr("pointer-events", "none"); 
        		
        		// calculate fake element id
        		index++;
        		highlightPathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + elem.type + index + ILLUSTRATOR_LABEL_DELIMITER + "highlight";
        		if(elem.parent().attr("id") == null || elem.parent().attr("id") != this.id) { // get only path/line/polyline elements which are direct children of the switch position
        			return;
        		}
        		
        		// calculate fake element coords
     			if(elem.type == "path") {
     				penCoords += " " + elem.attr('d') + "";
     				isPolygon = false;
     			} else if(elem.type == "polyline") {
     				var pointsArr = elem.attr("points");
     				for (var p=0; p < pointsArr.length; p++) {
     					if (p==0) {
     						//special case for first pair of coords
     						penCoords = "M" + pointsArr[p];
     					}else{
     						if (pointsArr[p] != "")
     							penCoords += " L" + pointsArr[p] + "";
     					}
     				}
     				isPolygon = false;
     			} else if(elem.type == "polygon") {
     				penCoords = elem.attr("points");
     				isPolygon = true;
     			} else if(elem.type == "line") {
     				var x1 = elem.attr("x1");
        			var y1 = elem.attr("y1")
        			var x2 = elem.attr("x2")
        			var y2 = elem.attr("y2")
        			penCoords = "M" + x1 + "," + y1 + " L" + x2 + "," + y2 + "";
        			isPolygon = false;
     			}   

     			// create the fake element and append it to the parent layer
     			var switchGroupElement = this.parent.highlightGroupElement;
            	if(penCoords != "" && switchGroupElement != null) {
            		if(isPolygon) {
            			highlightPathElement = switchGroupElement.polygon(penCoords).attr({ // don't know how to convert polygon coordinates to path coordinates
               		       id: highlightPathId
            			}).attr("pointer-events", "visibleStroke");
            		} else {
            			highlightPathElement = switchGroupElement.path(penCoords).attr({
               		       id: highlightPathId
            			}).attr("pointer-events", "visibleStroke");
            		}
            		highlightPathElement.attr("fill", "none"); // be careful with this, it is very important!
         			
            		// attach mouse events to the fake path element
         			highlightPathElement.click((function(e) {
         				this.parent.setSelectedPositionValue(this.value, true);
         			}).bind(this));
         			highlightPathElement.mouseout((function(e) {
         				if(this.parent.getSelectedPosition() != null && this.id == this.parent.getSelectedPosition().id) {
         					// if one of the switch position grpahic elements is highlighted the other in the group should be highlighted too
         					for(var n=0; n<this.highlightPathElements.length; n++) {
         						this.highlightPathElements[n].attr('class', WIRING_ANIMATION_CONSTANTS['switch_position_selected_class']);
         					}
         				} else {
         					// if one of the switch position grpahic elements is highlighted the other in the group should be highlighted too
         					for(var m=0; m<this.highlightPathElements.length; m++) {
         						this.highlightPathElements[m].attr('class', WIRING_ANIMATION_CONSTANTS['switch_position_mouseout_class']);
         					}
         				}
         			}).bind(this));
         			highlightPathElement.mouseover((function(e) {
     					// if one of the switch position grpahic elements is highlighted the other in the group should be highlighted too
         				for(var s=0; s<this.highlightPathElements.length; s++) {
     						this.highlightPathElements[s].attr('class', WIRING_ANIMATION_CONSTANTS['switch_position_mouseover_class']);
     					}
         			}).bind(this));
         			
         			// add the fake element to the collection
            		this.highlightPathElements.push(highlightPathElement);
            	} else {
            		alert(localize("Cannot create path highlight element for the swith postion {id}.\n Switch position element should be a path, line, polyline or polygon element.", {id:self.id}));
     				return;
            	}
     		}).bind(this));
        };
   
