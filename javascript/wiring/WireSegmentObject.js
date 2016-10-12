/**
 * WireSegment UI.
 * This is the graphical representation of the wire segment in the SVG drawing.
 * A wire segment could be represented as path, line or polyline element in the SVG.
 * 
 * NOTE: In order to support the visual highlight and animation flow over a wire (i.e. to make the wire "hot"/"cold"/"flow")
 * a couple of additional elements are created and appended to the SVG on the fly for each wire.
 * They are not saved in the SVG and exists only when the page is opened. 
 * 
 * 1) highlight support (make a wire "hot"): 
 * - a highlight layer element with id = "highlight" + <circuit type>
 * - a highlight path child element with a specific class to be highlighted when the wire is made hot (id = <wire id> + "hot")
 * - example:
 * <g id="highlight_x005F_battery" class="CircuitHighlighting">
 * 	<path id="circuit_x005F_1_x005F_hot"/>
 * </g>
 *   
 * 2) animation flow support (make a wire "flow"): 
 * - a flow layer element with id = "flow" + <circuit type>
 * - a flow path child element with a specific class to be animated when the wire is made flow (id = <wire id> + "e")
 * - an animate child element of the path element to hold the actual animation (id = <wire id> + "flow")
 * - example:
 * <g id="flow_x005F_battery" class="CircuitCurrentFlow">
 * 	<path id="circuit_x005F_1_x005F_e">
 * 		<animate id="circuit_x005F_1_x005F_flow"/>
 *  </path>
 * </g>
 *   
 * 3) mouse events support: 
 * - a mouse layer element with id = "mouse" + <wire id>
 * - a mouse path child element with specific class(es) to capture the mouse events over the wire (id = <wire id> + "mouse")
 * - example:
 * <g id="mouse_x005F_circuit_x005F_1" class="WireSegmentMouseOut">
 * 	<path id="circuit_x005F_1_x005F_mouse"/>
 * b</g>
 *   
 */
(function ($) { 
	
	/**
	 * WireSegmentObject constructor.
	 * @param svg Snap object The DOM representation of the SVG drawing.
	 * @param element Snap object The XML node representing the wire in the SVG drawing.
	 * @param circType CircuitType Object representing the wire circuit type.
	 * @param wiringDiagram AnimatedWiringDiagram object The wiring diagram which the wire belongs to
	 */
	$.WireSegmentObject = function (svg, element, circType, wiringDiagram) {
		
		this.svg = svg;
		this.element = element;
		this.circuitType  = circType;
		this.wiringDiagram = wiringDiagram;
		if(circType != null) {
			circType.hasWires = true;
		}
		this.id = this.element.attr("id");
		
		this.isAuthoring = wiringDiagram.isAuthoring; // True if object is used in SALSSA application (authoring mode), False if it is used in the AWD viewer
		this.appContext = wiringDiagram.appContext; // Context in which the object exists (SlideAlbum in the SALSSA context, WireDiagram in the context of the AWD viewer)
		
		// properties to make a wire "hot"
		this.highlightGroupId = this.circuitType != null ? this.circuitType.highlightGroupId : "highlight_group"; // id of highlight layer element, e.g. "highlight_x005F_battery"
		this.highlightPathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "hot";  // id of the highlight path element, e.g. "circuit_x005F_b01_x005F_1_x005F_hot" or "circuit_x005F_1_hot"
		this.highlightColor = this.circuitType != null ? this.circuitType.highlightColor : null; // highlight color is determined by the wire circuit type
		this.highlightClass = WIRING_ANIMATION_CONSTANTS['circuit_type_highlight_class']; // highlight path element class
		this.highlightGroupElement = null;
		
		// properties to make a wire "flow"
		this.flowGroupId = this.circuitType != null ? "flow" + ILLUSTRATOR_LABEL_DELIMITER + this.circuitType.type : "animationFlow_group"; // id of the flow layer element, e.g. "highlight_x005F_battery"
		this.flowPathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "e"; // id of the flow path element, e.g. "circuit_x005F_b01_x005F_1_x005F_e" or "circuit_x005F_1_e"
		this.animationElementId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "flow"; // id of the animation child element, e.g. "circuit_x005F_b01_x005F_1_x005F_flow" or circuit_x005F_1_x005F_flow
		this.flowClass = WIRING_ANIMATION_CONSTANTS['wire_segment_flow_class']; // flow path element class
		this.flowGroupElement = null;
		
		// properties to make wire to respond to mouse events
		this.mouseEventsGroupId = "mouse" + ILLUSTRATOR_LABEL_DELIMITER + this.id; // id of the mouse layer element, e.g. "mouse_x005F_circuit_x005F_b01_x005F_1_x005F" or "mouse_x005F_circuit_x005F_1"
		this.mouseEventsPathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "mouse"; // id of the mouse path element, e.g. "circuit_x005F_b01_x005F_1_x005F_mouse" or "circuit_x005F_1_x005F_mouse"
		
		// properties to assign circuit type to a wire
		this.circTypeGroupId = this.circuitType != null ? "circType" + ILLUSTRATOR_LABEL_DELIMITER + this.circuitType.type : "circType_group"; // id of circType layer element, e.g. "circType_x005F_battery"
		this.circTypePathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "circTypeHot";  // id of the circType path element, e.g. "circuit_x005F_b01_x005F_1_x005F_circTypeHot" or "circuit_x005F_1_circTypeHot"
		this.circTypeColor = this.circuitType != null ? this.circuitType.highlightColor : null; // circType color is determined by the wire circuit type
		this.circTypeClass = WIRING_ANIMATION_CONSTANTS['circuit_type_highlight_class']; // circType path element class
		this.circTypeGroupElement = null;
		
		this.state = "cold";
		this.flowDirection = null;		  
				
		this.createUIHelpElements();
		
		this.label = null; // color blind balloon over the wire (if any)
	};

	/**
	 * WireSegmentObject methods
	 */
    $.WireSegmentObject.prototype = {
    	
    	/**
    	 * Create the highlight functionality help elements and append them to the DOM.
    	 */
    	createHighlightFakeElements: function() {
			var self = this;
			var penCoords = this.calculatePathCoordinates();
    		var highlightGroupElement = this.svg.g().attr({ // create highlight layer group element
    			id: self.highlightGroupId
    		}).attr("pointer-events", "all").addClass(self.highlightClass);
    		if(highlightGroupElement != null) {
     			var highlightPathElement = highlightGroupElement.path(penCoords).attr({ // create highlight path element and add it to the highlight group element
         			id: self.highlightPathId,
         		    	stroke: self.highlightColor,
         		        visibility: "hidden"
         		}).attr("pointer-events", "visibleStroke");
     		}
    		this.highlightGroupElement = highlightGroupElement;
		},
		
		/**
    	 * Create the circuit type assignment functionality help elements and append them to the DOM.
    	 */
    	createCircTypeAssignmentFakeElements: function() {
			var self = this;
			var penCoords = this.calculatePathCoordinates();
    		var circTypeGroupElement = this.svg.g().attr({ // create highlight layer group element
    			id: self.circTypeGroupId
    		}).attr("pointer-events", "all").addClass(self.circTypeClass);
    		if(circTypeGroupElement != null) {
     			var circTypePathElement = circTypeGroupElement.path(penCoords).attr({ // create highlight path element and add it to the highlight group element
         			id: self.circTypePathId,
         		    	stroke: self.circTypeColor,
         		        visibility: "hidden"
         		}).attr("pointer-events", "visibleStroke");
     		}
    		this.circTypeGroupElement = circTypeGroupElement;
		},
		
		/**
    	 * Create the animation functionality help elements and append them to the DOM.
    	 */
		createAnimationFakeElements: function() {
			var self = this;
			var penCoords = this.calculatePathCoordinates();
        	var	animationFlowGroupElement = this.svg.g().attr({ // create animation flow layer group element
        		id: self.flowGroupId
        	}).attr("pointer-events", "all").addClass(self.flowClass);
        	if(animationFlowGroupElement != null) {
 	 			var animatedDashColor = this.getAnimationDashColor();
 				var flowPathElement = animationFlowGroupElement.path(penCoords).attr({ // create animation flow path element and add it to the animation flow group element
 	 		        id: self.flowPathId,
 	 		        stroke: animatedDashColor,
 	 		        visibility: "hidden"
 	 		    }).attr("pointer-events", "visibleStroke");
 	     		var animElem = document.createElementNS("http://www.w3.org/2000/svg", "animate"); // create and append the animation object
 	 			animElem.setAttributeNS(null, "id", self.animationElementId);
 	 			animElem.setAttributeNS(null, "attributeType", "XML");
 	 			animElem.setAttributeNS(null, "attributeName", "stroke-dashoffset");
 	 			animElem.setAttributeNS(null, "dur", "10s");
 	 			animElem.setAttributeNS(null, "from", "100%");
 	 			animElem.setAttributeNS(null, "to", "0%");
 	 			animElem.setAttributeNS(null, "begin", "indefinite");
 	 			animElem.setAttributeNS(null, "end", "indefinite");
 	 			animElem.setAttributeNS(null, "repeatCount", "indefinite");
 	 			flowPathElement.node.appendChild(animElem);     			
 	    		if(!SMIL_SUPPORT) {
 	    			registerAnimation(animElem); // call a 3rd party lib method to deal with the animation if SMIL is not supported
 	    		}
 			}
        	this.flowGroupElement = animationFlowGroupElement;
        	if(this.circuitType == null) {
        		this.flowGroupElement.attr("visibility", "hidden"); 
        	}
		},
    	
    	/**
    	 * Creates and appends to the SVG DOM on the fly the help elements,
    	 * providing the ability to higlight and animate a wire.
    	 */
    	createUIHelpElements: function() {	
    		var self = this;
   			this.createHighlightFakeElements(); // create highlight functionality help elements    		
            this.createAnimationFakeElements();  // create animation flow functionality help elements 
            this.createCircTypeAssignmentFakeElements(); // create circuit type assignment functionality help elements 
    		
            if(this.isAuthoring) {
	    		var penCoords = this.calculatePathCoordinates(); // calculate fake path elements coordinates
	    		var mouseEventsGroupElement = null; // create mouse layer group element
	 			mouseEventsGroupElement = this.svg.g().attr({ 
	    			id: self.mouseEventsGroupId
	    		}).attr("pointer-events", "all");
	 			var mouseEventsPathElement = null;    		
	 			mouseEventsPathElement = mouseEventsGroupElement.path(penCoords).attr({ // add mouse path element to the mouse events group
	 		        id: self.mouseEventsPathId
	 		    }).addClass(WIRING_ANIMATION_CONSTANTS['wire_segment_mouseout_class']).attr("pointer-events", "visibleStroke"); 
	 			// attach mouse events handlers to the mouse path elements
	 			if(this.circuitType != null) {
	 				mouseEventsPathElement.click(function(e) { 		
	 	    			self.clickWire();
	 	 			});
	 			}
	    		mouseEventsPathElement.mouseout(function(e) {
	 				mouseEventsPathElement.attr("class", WIRING_ANIMATION_CONSTANTS['wire_segment_mouseout_class']);
	 			});
	    		mouseEventsPathElement.mouseover(function(e) {
	 				mouseEventsPathElement.attr("class", WIRING_ANIMATION_CONSTANTS['wire_segment_mouseover_class']);
	 			}); 	
            }
    	},
    	
    	/**
    	 * Translate wire path/line/polyline coordinates to path coordinates
    	 * @returns string The translated path coordinates
    	 */
    	calculatePathCoordinates: function() {                        
    		var penCoords = "";
    		if(this.element.type == "path") {
 				penCoords = this.element.attr('d');    			     			
 			} else if(this.element.type == "polyline") {
 				var pointsArr = this.element.attr("points");
 				var pointsStr = pointsArr.toString();
 				if(pointsStr.charAt(0) === ',')
 					pointsStr = pointsStr.substr(1);
 				penCoords = "M" + pointsStr;
 			} else if(this.element.type == "line") {
 				var x1 = this.element.attr("x1");
    			var y1 = this.element.attr("y1")
    			var x2 = this.element.attr("x2")
    			var y2 = this.element.attr("y2")
    			penCoords = "M" + x1 + "," + y1 + " L" + x2 + "," + y2 + "";
 			}
    		return penCoords;
    	},
    	
    	/**
    	 * Click wire event handler - turn the wire "cold"/"hot"/"flow" depending on the click sequence.
    	 */
    	clickWire: function() {	
    		switch (this.state) {
				case "cold"	:
					this.makeHot(true)
					break;
				case "hot"	:
					this.makeFlow("+", true)
					break
				case "flow"	:
					if (this.flowDirection == "+") {
						this.makeFlow("-", true); // invert or reverse direction of flow
					}else{
						this.makeFlow("+", true) // already reversed, now return to cold state and toggle direction
						this.makeCold(true);
					}
					break;
			}
    		if(this.isAuthoring) {
    			var slideAlbum = this.appContext;
    			if (slideAlbum.animationsMgr.currentSlideIndex > 1) { // if selected slide is not the first one
    				slideAlbum.isDirty = true;
    			}
    		}
    	},
    	
    	/**
    	 * Make the wire "hot", i.e. highlight it with the color corresponding to the wire circuit type color.
    	 * @param isUserSelection True if user has manually made the wire hot, false if it is set automatically by the application (when loading slide/animation)
    	 */
    	makeHot: function(isUserSelection) {    		
    		
    		this.makeStop();
    		this.svg.select("#" + this.highlightPathId).attr("visibility", "visible");
    		this.state = "hot";
    		
    		if(this.isAuthoring) { // only for authoring mode (SALSSA)
    			
    			if(this.label != null) { // show label (if any)
        			this.label.show();
        		}
    			
    			// update the context
        		var slideAlbum = this.appContext;
        		var notTheLastSlide = slideAlbum.animationsMgr.currentSlideIndex < slideAlbum.animationsMgr.slides.length;
        		var notTheFirstSlide = slideAlbum.animationsMgr.currentSlideIndex > 1;
        		
        		// display Propagate Changes button if it is authoring mode, the user has selected the new value manually and if this is not the last slide
        		if(isUserSelection && notTheLastSlide) {
        			var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
        			var currentActor = currentSlide.actors[this.id];
        			var copiedActor = new $.WireSegment(this.id, this.wiringDiagram);
    				copiedActor.state = "hot";
        			currentSlide.isDirty = true;
        			currentSlide.changes[this.id] = copiedActor; //save the change to be propagated by storing the corresponding actor and its state
        			$("#propagateChanges").show(); // show the button
        		} 
        		// update the corresponding balloon actor if it is in authoring mode and it is not the first slide selected
    			if(notTheFirstSlide) {
    				var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
    				currentSlide.actors[this.id].state = "hot";     
    			}
    		} else {
    			var viewerDiagram = this.appContext; // AWD Viewer
    			if(this.label != null && viewerDiagram.showLabels) {	// show label in AWD viewer only if property for showing labels is checked
        			this.label.show();
        		}
    		}
    	},
    	
    	/**
    	 * Make the wire "cold", i.e. turn it to normal state (not highlighte or animated).
    	 * @param isUserSelection boolean True if user has manually made the wire cold, false if it is set automatically by the application (when loading slide/animation)
    	 * @param doNotAffectSlide boolean
    	 */
    	makeCold: function(isUserSelection, doNotAffectSlide) {
    		if(typeof doNotAffectSlide === 'undefined') { doNotAffectSlide = 'false'; }
    		this.makeStop();
    		this.svg.select("#" + this.highlightPathId).attr("visibility", "hidden");
    		this.state = "cold";
    		if(this.label != null) {
    			this.label.hide();
    		}
    		
    		if(this.isAuthoring) { // only for authoring mode (SALSSA)
    		
    			// update the context
        		var slideAlbum = this.appContext;
        		var notTheLastSlide = slideAlbum.animationsMgr.currentSlideIndex < slideAlbum.animationsMgr.slides.length;
        		var notTheFirstSlide = slideAlbum.animationsMgr.currentSlideIndex > 1;

        		// display Propagate Changes button if it is authoring mode, the user has selected the new value manually and if this is not the last slide
        		if(isUserSelection && notTheLastSlide) {
        			var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
        			var currentActor = currentSlide.actors[this.id];
        			var copiedActor = new $.WireSegment(this.id, this.wiringDiagram);
    				copiedActor.state = "cold";
        			currentSlide.isDirty = true;
        			currentSlide.changes[this.id] = copiedActor; //save the change to be propagated by storing the corresponding actor and its state
        			$("#propagateChanges").show(); // show the button
        		} 
        		// update the corresponding balloon actor if it is in authoring mode and it is not the first slide selected      
        		if(doNotAffectSlide != true && notTheFirstSlide == true) {
    				var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
    				currentSlide.actors[this.id].state = "cold";     
    			}
    		} 
    	},
    	
    	/**
    	 * Make the wire "flow", i.e. animate it with a flow.
    	 * @param direction string The animation flow direction
    	 * @param isUserSelection boolean True if user has manually made the wire flow, false if it is set automatically by the application (when loading slide/animation)
    	 */
    	makeFlow: function(direction, isUserSelection) {
    		if(this.circuitType == null) {
    			// nothing
    			return "";
    		}
    		var flowPathElement = this.svg.select("#"+this.flowPathId);
    		this.svg.select("#" + this.highlightPathId).attr("visibility", "visible");
    		if(direction == null || direction == "") {
    			if(this.isDirectionReversed(flowPathElement)) {
    				this.setCurrentFlowDirection("-", flowPathElement);
    				this.flowDirection = "-";
    			} else {
    				this.setCurrentFlowDirection("+", flowPathElement);
    				this.flowDirection = "+";
    			}
    		} else {
    			if(direction == "+") {
    				this.flowDirection = "+";
    				this.setCurrentFlowDirection("+", flowPathElement);
    			} else {
    				this.flowDirection = "-";
    				this.setCurrentFlowDirection("-", flowPathElement);
    			}
    		}
    		
    		if(this.isAuthoring) { // only for authoring mode (SALSSA)
    			
    			if(this.label != null) { // show label (if any)
        			this.label.show();
        		}
    			
    			// update the context
        		var slideAlbum = this.appContext;
        		var notTheLastSlide = slideAlbum.animationsMgr.currentSlideIndex < slideAlbum.animationsMgr.slides.length;
        		var notTheFirstSlide = slideAlbum.animationsMgr.currentSlideIndex > 1;
        		
        		// display Propagate Changes button if it is authoring mode, the user has selected the new value manually and if this is not the last slide
        		if(isUserSelection && notTheLastSlide) {
        			var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
        			var currentActor = currentSlide.actors[this.id];
        			var copiedActor = new $.WireSegment(this.id, this.wiringDiagram);
        			copiedActor.state = "flow";
    				copiedActor.flowDirection = direction;
        			currentSlide.isDirty = true;
        			currentSlide.changes[this.id] = copiedActor; //save the change to be propagated by storing the corresponding actor and its state
        			$("#propagateChanges").show(); // show the button
        		} 
        		// update the corresponding balloon actor if it is in authoring mode and it is not the first slide selected
    			if(notTheFirstSlide) {
    				var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
    				currentSlide.actors[this.id].state = "flow";  
    				currentSlide.actors[this.id].flowDirection = direction;     
    			}
    		} else {
    			var viewerDiagram = this.appContext; // AWD Viewer
    			if(this.label != null &&  viewerDiagram.showLabels) {	// show label in AWD viewer only if property for showing labels is checked
        			this.label.show();
        		}
    		}
    	},
    	
    	/**
    	 * Stop the animation flow and hide the flow path element.
    	 */
    	makeStop: function() {
    		if(this.svg.select("#"+this.flowPathId) != null) {
    			this.svg.select("#"+this.flowPathId).attr("visibility", "hidden");
        		this.svg.select("#" + this.animationElementId).node.endElement();
    		}
    		this.state = "hot";
    		if(this.label != null) {
    			this.label.show();
    		}
    	},
    	
    	/**
    	 * Set the animation flow direction and start the animation.
    	 */
    	setCurrentFlowDirection: function(direction, flowPathElement) {		
    		direction = direction == null ? "+" : direction;
    		var animatedElement = this.svg.select("#"+this.animationElementId);
			var length = flowPathElement.getTotalLength();
    		if(direction == "+") {
    			animatedElement.attr("from", "0%");
    			animatedElement.attr("to", "100%");		
    			if(!SMIL_SUPPORT)
    				registerAnimation(animatedElement.node);
    		} else {
    			animatedElement.attr("to", "0%");
    			animatedElement.attr("from", "100%");
    			if(!SMIL_SUPPORT)
    				registerAnimation(animatedElement.node);
    		}
    		flowPathElement.attr("visibility", "visible");
    		animatedElement.node.beginElement();
    		this.state = "flow";
    	},
    	
    	/**
    	 * Check if the flow direction is reversed checking the flow path element coordinates.
    	 * @param flowPathElement Snap path element The animation flow path element
    	 * @return boolean Whether the animation flow is reversed or not
    	 */
    	isDirectionReversed: function(flowPathElement) {
    		if(flowPathElement.type == "path") {
    			var pathCoords = flowPathElement.attr("d");
        		var reverseFlow = false
        		if ((pathCoords.indexOf("-") > -1) || (pathCoords.indexOf("V") > -1)  || (pathCoords.indexOf("H") > -1)) {
        			reverseFlow = true
        		}        		
        		return reverseFlow;
    		}
    		return false;
    	},
    	
    	/**
    	 * Get the color for the dash animation array regarding the stroke property of the circuit type layer element (if any, otherwise - white).
    	 * @returns string The dash animation array color.
    	 */
    	getAnimationDashColor: function() { // LEGACY! 		
    		var wireGraphicColor = null; // color of the line-segment graphic in original SVG file that represents the wire (not color of the wire)
 			var animatedDashColor = null;;
 			wireGraphicColor = (this.circuitType != null && this.svg.select("#" + this.circuitType.circuitTypeGroupId) != null) ?
 					this.svg.select("#" + this.circuitType.circuitTypeGroupId).attr("stroke").toUpperCase() : "none"; 			
 			switch (wireGraphicColor)
 			{
 				case	"BLACK"		:
 						animatedDashColor = "white"
 						break;
 				case 	"#000000"	: // Black
 						animatedDashColor = "white"
 						break;
 				case	"YELLOW"	: 
 						animatedDashColor = "black"
 						break;
 				case 	"#FFFF00"	: // Yellow
 						animatedDashColor = "black"
 						break;
 				case 	"#B6B6B6"	: // Gray
 						animatedDashColor = "black"
 						break;
 				case	"#008000"	: // Med. Green
 						animatedDashColor = "white"
 						break;
 				case	"#00FF00"	: // Lt. Green // 
 						animatedDashColor = "black"
 						break;
 				case	"PURPLE"	: // Purple
 						animatedDashColor = "white"
 						break;
 				default				:
 						animatedDashColor = "white"
 			}
 			return animatedDashColor;				
    	},
    	
    	/**
    	 * Find and initialize a wire circuit label object (if any).
    	 * NOTE: legacy and not used
    	 */ 
    	findWireSegmentCircuitLabel: function() {
    		var labelsLayerID = "layer_x005F_circuits"; 
    		var labelsLayerElement = this.svg.select("#"+labelsLayerID);
    		var labelElementId = this.id.replace("circuit_", "cb_"); // NOTE: circuit label has the same id as the wire segment but "circuit" is replaced with "cb"
    		var labelElement = this.svg.select("#"+labelElementId);
    		if(labelsLayerElement != null && labelElement != null) {
    			this.label = new $.WireSegmentLabelObject(labelElement, this);
    		}
    	},
    	
    	/**
    	 * Check if circuit type is shown.
    	 * @returns boolean True if circuit type is shown, false otherwise.
    	 */
    	isCircuitTypeShowing: function() {
    		return this.svg.select("#" + this.circTypePathId).attr("visibility") === "visible";
    	},
    	
    	/**
    	 * Show circuit type (i.e. highlight the wire with the color of its circuit type).
    	 */
    	showCircType: function() {    		
    		this.svg.select("#" + this.circTypePathId).attr("visibility", "visible");
    	},
    	
    	/**
    	 * Hide circuit type.
    	 */
    	hideCircType: function() {    		
    		this.svg.select("#" + this.circTypePathId).attr("visibility", "hidden");
    	},
    	
    	/**
    	 * Set new circuit type for the wire.
    	 * This includes recreation of the highlight help elements.
    	 * @param circuitTypeObj CircuitType New circuit type to be assigned to the wire.
    	 */
    	updateCircuitType: function(circuitTypeObj) {
    		this.circuitType = circuitTypeObj;
    		
    		// update wire help animation elements and their properties
    		this.highlightGroupId = this.circuitType != null ? this.circuitType.highlightGroupId : "highlight_group";
    		this.highlightPathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "hot"; 
    		this.highlightColor = this.circuitType != null ? this.circuitType.highlightColor : null; 
    		
    		this.flowGroupId = this.circuitType != null ? "flow" + ILLUSTRATOR_LABEL_DELIMITER + this.circuitType.type : "animationFlow_group";
    		
    		this.circTypeGroupId = this.circuitType != null ? "circType" + ILLUSTRATOR_LABEL_DELIMITER + this.circuitType.type : "circType_group"; // id of circType layer element, e.g. "circType_x005F_battery"
    		this.circTypePathId = this.id + ILLUSTRATOR_LABEL_DELIMITER + "circTypeHot";  // id of the highlight path element, e.g. "circuit_x005F_b01_x005F_1_x005F_circTypeHot" or "circuit_x005F_1_circTypeHot"
    		this.circTypeColor = this.circuitType != null ? this.circuitType.highlightColor : ""; // highlight color is determined by the wire circuit type
    		this.circTypeClass = WIRING_ANIMATION_CONSTANTS['circuit_type_highlight_class']; // highlight path element class
    		
    		this.highlightGroupElement.attr("id", this.highlightGroupId);
    		this.flowGroupElement.attr("id", this.flowGroupId);
    		this.circTypeGroupElement.attr("id", this.circTypeGroupId);
    		
    		this.svg.select("#"+this.circTypePathId).attr("stroke", this.circTypeColor);
    		this.svg.select("#"+this.highlightPathId).attr("stroke", this.highlightColor);
    		
    		// update color blind balloon properties
    		if(circuitTypeObj != null && (circuitTypeObj.colorBlindBalloonFontColor == null || circuitTypeObj.colorBlindBalloonFontColor == "")) {
    			// use default config if this circuit type is configured    			
    			if(circuit_types[circuitTypeObj.type] != null) {
    				this.wiringDiagram.circuitTypes[circuitTypeObj.type].colorBlindBalloonFontColor = circuit_types[circuitTypeObj.type]['colorBlindBalloonFontColor'];
        			this.circuitType.colorBlindBalloonFontColor = circuit_types[circuitTypeObj.type]['colorBlindBalloonFontColor'];
    			}
    		} 
    		if(circuitTypeObj != null && (circuitTypeObj.colorBlindBalloonText == null || circuitTypeObj.colorBlindBalloonText == "")) {
    			// use default config if this circuit type is configured
    			if(circuit_types[circuitTypeObj.type] != null) {
        			this.wiringDiagram.circuitTypes[circuitTypeObj.type].colorBlindBalloonText = circuit_types[circuitTypeObj.type]['colorBlindBalloonText'];
        			this.circuitType.colorBlindBalloonText = circuit_types[circuitTypeObj.type]['colorBlindBalloonText'];
    			}
    		}
    		    		
    		// update color blind balloon (if any)
    		if(this.label != null) {
    			if(circuitTypeObj != null) {
    				var text = circuitTypeObj.colorBlindBalloonText == null || circuitTypeObj.colorBlindBalloonText == "" ? 
        					circuitTypeObj.type.charAt(0).toUpperCase() : circuitTypeObj.colorBlindBalloonText;
        			var fontColor = circuitTypeObj.colorBlindBalloonFontColor == null || circuitTypeObj.colorBlindBalloonFontColor == "" ? 
        					"black" : circuitTypeObj.colorBlindBalloonFontColor;
        			this.label.setValue(text, circuitTypeObj.color, fontColor);
    			} else {
    				this.label.setValue("", "white", "black");
    			}
    		}
    	},
    };
}(jQuery));


/**
 * WireSegmentLabelObject.
 * Represent a graphical element shown over the wire segment to indicate the circuit type of the wire when it is highlighted.
 * It displays the first letter of the circuit type in a small balloon and is used instead of circuit type color because of color blind people.
 */
(function ($) { 
	
	/**
	 * WireSegmentLabelObject constructor.
	 * @param element Snap object The svg element representing the circuit label
	 * @param wireSegment WireSegmentObject The parent wire segment UI object
	 * @param applyCustomProperties boolean
	 */
	$.WireSegmentLabelObject = function (element, wireSegment, applyCustomProperties) {
		
		this.element = element;
		this.wireSegment = wireSegment;
		this.id = element.id;
		
		this.textValue = (wireSegment.circuitType == null) ? "" :
				(wireSegment.circuitType.colorBlindBalloonText != null ? wireSegment.circuitType.colorBlindBalloonText : wireSegment.circuitType.type.charAt(0).toUpperCase()); 
		this.color =  wireSegment.circuitType != null ? wireSegment.circuitType.color : "white";
		this.fontColor = (wireSegment.circuitType == null) ? "" :
			(wireSegment.circuitType.colorBlindBalloonFontColor != null ? wireSegment.circuitType.colorBlindBalloonFontColor : "black"); 
		
		if(applyCustomProperties) {
			this.setValue(this.textValue, this.color, this.fontColor);
		}
		
		this.attachMouseEvents(); // attach mouse event handlers to the balloon node
	};
	
	/**
	 * WireSegmentLabelObject methods
	 */
	$.WireSegmentLabelObject.prototype = {
		
		/**
		 * Show circuit label
		 */
		show: function() {
			this.element.attr("visibility", "visible");
		}, 
		
		/**
		 * Hide circuit label
		 */
		hide: function() {
			this.element.attr("visibility", "hidden");
		},
		
		/**
		 * Set value for the wire label.
		 * This includes setting color and text (with specified font color) for the balloon.
		 * @param text string Balloon text value
		 * @param color string Balloon color
		 * @param fontColor string The color of the balloon text
		 */
		setValue: function(text, color, fontColor) {
			this.textValue = text;
			this.color = color;
			this.fontColor = fontColor;
			
			var pathNode = this.element.select("ellipse, path");
			if(pathNode != null) {
				pathNode.attr("fill", color);
			}
			
			var textNode = this.element.select("tspan");
			if(textNode == null) {
				textNode = this.element.select("text");
			}
			if(textNode != null) {
				textNode.node.textContent = text;
				textNode.attr("fill", fontColor);
			}
		},
		
		/**
		 * Change color blind balloon properties (text and font color). The color of a baloon depends on the circuit type color.
		 * NOTE: this affects not only current label, but all labels over wires with the same circuit type.
		 * @param text string Balloon text value
		 * @param fontColor string The color of the balloon text
		 */
		setProperties: function(text, fontColor) {
			this.textValue = text;
			this.fontColor = fontColor; 
			
			var pathNode = this.element.select("ellipse, path");			
			var textNode = this.element.select("tspan");
			if(textNode == null) {
				textNode = this.element.select("text");
			}
			if(textNode != null) {
				textNode.node.textContent = text;
				textNode.attr("fill" , fontColor);
			}
			this.wireSegment.circuitType.colorBlindBalloonFontColor = fontColor;
			this.wireSegment.circuitType.colorBlindBalloonText = text;
			
			var wiringDiagram = this.wireSegment.wiringDiagram;
			var circType = wiringDiagram.circuitTypes[this.wireSegment.circuitType.type];
			circType.colorBlindBalloonFontColor = fontColor;
			circType.colorBlindBalloonText = text;
			
			var allBalloons = wiringDiagram.wireSegmentLabels;
			for(var key in allBalloons) {
				var ballonObj = allBalloons[key];
				if(ballonObj.wireSegment.circuitType != null && ballonObj.wireSegment.circuitType.type == circType.type) {
					ballonObj.setValue(text, circType.color, fontColor);
				}
			}
			this.wireSegment.wiringDiagram.isDirty = true;
		},
		
		/**
		 * Attach mouse events to the color blind balloon node:
		 * - mouseover: change cursor to show the balloon is clickable;
    	 * - mouseout: turn back the cursor when mouse leaves the balloon;
    	 * - click: show the text and font color selection box.
		 */
		attachMouseEvents: function() {
    		var self = this;
    		this.element.mouseover(function(evt) {
    			evt.target.style.cursor = "hand";
    		});
    		this.element.mouseout(function(evt) {
    			evt.target.style.cursor = "auto";
    		});
    		this.element.click(function() {
    			if(self.wireSegment.circuitType != null) {
        			self.showValuePromptBox();
    			}
    		});
    	},
    	
    	/**
    	 * Display a dialog box for entering color blind balloon properties: text and font color.
    	 * Properties become valid for every color blind ballon assigned to a wire of the same circuit type.
    	 */
    	showValuePromptBox: function() {
    		var self = this;
    		$("#balloonText").val(self.textValue);
			$("#balloonColorPicker").spectrum({
    			  "showPaletteOnly": true,
    			  "togglePaletteOnly": false,
    			  "togglePaletteMoreText": "more",
    			  "togglePaletteLessText": "less",
    			  "hideAfterPaletteSelect": true,
    			  "color": self.fontColor,
    			  "palette": [
    			        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
    			        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
    			        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
    			        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
    			        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
    			        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
    			        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
    			        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    			    ]
    		});
    		$("#colorBlindBalloonDialog").modal('show');
    		$("#setBalloonProps").off().on("click", function() {
    			var fontColor = $("#balloonColorPicker").spectrum('get').toHexString();
    			var balloonText = $("#balloonText").val();
        		self.setProperties(balloonText, fontColor);
        		$("#colorBlindBalloonDialog").modal('hide');
    		});
        }
	};
}(jQuery));