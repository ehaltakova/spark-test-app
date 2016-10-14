/**
 * SALSSA2 actors labeling constants
 * (configurable, see wiring_animation_constants.js file).
 */
var LABEL_DELIMITER = WIRING_ANIMATION_CONSTANTS['SALSSA2_label_delimiter'];
var CIRCUITS_LAYER = WIRING_ANIMATION_CONSTANTS['SALSSA2_circuits_layer'];
var CIRCUIT_PREFIX = WIRING_ANIMATION_CONSTANTS['SALSSA2_wire_label_prefix'];
var SWITCHES_LAYER = WIRING_ANIMATION_CONSTANTS['SALSSA2_switches_layer'];
var SWITCH_PREFIX = WIRING_ANIMATION_CONSTANTS['SALSSA2_switch_label_prefix'];
var DCBALLOOONS_LAYER = WIRING_ANIMATION_CONSTANTS['SALSSA2_dcballoons_layer'];
var DCBALLOOON_PREFIX = WIRING_ANIMATION_CONSTANTS['SALSSA2_dcballoon_label_prefix'];

/**
 * Animated Wiring Diagram.
 * 
 * An animated wiring diagram is represented by a svg drawing and collection of animations to it (animation slides).
 * An animation represents the current state of each one of the diagram's actors.
 * The actors being objects of animation could be as follows.
 * - wiring segments/circuits: hot|cold|flow
 * - switches: postions being turned off/on
 * - voltage ballons: voltage values
 * 
 * The animated wiring diagram could exist in two different contexts (appContext):
 * - SALSSA: used in a slide album where it can be animated (authoring mode)
 * - AWD Viewer: used in a viewer where its animations could be viewed.
 * Every animation is called slide in the contetx of a slide album.
 * 
 * The animated wiring diagram holds information about the actors and their states and create and manages
 * the visual objects, representing the actors in the drawing and their state.
 */
	
	/**
	 * Animated Wiring Diagram constructor
	 * @param svgHandler SVGHandler Drawing SVG document wrapper object
	 * @param animationData Object Object holding the existing animation data (if any) for the slide album
	 * @param slideAlbumData Object holding the basic slide album data (if diagram is opened in a slide album, otherwise - null) 
	 * @param circuitTypesData Object Object holding user specified circuit type data (if any)
	 * @param isAuthoring boolean True if diagram is opened in authoring mode (in a slide album in SALSSA), false if it is opened in the AWD Viewer
	 * @param appContext object (SlideAlbum | WireDiagram) Context in which the object exists: object is of type SlideAlbum in the SALSSA context and of type WireDiagram in the context of the AWD viewer.
	 */
	AnimatedWiringDiagram = function (svgHandler, animationData, slideAlbumData, circuitTypesData, isAuthoring, appContext) {
					
		this.svgHandler = svgHandler;
		this.svg = svgHandler.svg;
		this.animationData = animationData;
		this.slideAlbumData = slideAlbumData; // null if it is not authoring mode
		this.circuitTypesData = circuitTypesData;
		this.circuitTypesToWires = (this.circuitTypesData != null && this.circuitTypesData['circuitTypesToWires'] != null && this.circuitTypesData['circuitTypesToWires'].length!=0) ? this.circuitTypesData['circuitTypesToWires'] : {};
		
		this.isAuthoring = isAuthoring;
		this.appContext = appContext;
		
		this.actors = {};
		
		this.circuitTypes = null;
		this.switches = null;
		this.balloons = null;
		this.wireSegments =  null;
					
		this.isLegacy = false;
					
		this.balloonsToWires = {};
		this.wireSegmentLabels = {};
	};

	/** 
	 * Animated Wiring Diagram methods
	 */

    	/**
    	 * Initialize a wiring diagram:
    	 * - create UI objects to enable actors to be animated (authoring mode) or to display existing animations
    	 * - create drawing actor objects
    	 */
    	AnimatedWiringDiagram.prototype.init = function() {
    		    		    		
    		this.isLegacy = this.isSVGLegacy();
    		
    		// create and collect the UI objects
    		this.circuitTypes = this.getCircuitTypes();
    		this.switches = this.getSwitches();
    		this.balloons = this.getBalloons();
    		this.wireSegments = this.getWireSegments();
    		this.createColorBlindBalloons();
    		
    		// collect slide album actors
    		this.actors = this.getActors();
    		
        	this.moveCircuitLabelsToTop(); // move circuit labels (if any) to top    		
     	};
    	
    	/** 
    	 * Find and create all actors in the wiring diagram.
    	 * @returns map A map collection of actors (key - actor id, value - actor)
    	 */
     	AnimatedWiringDiagram.prototype.getActors = function() {
     		
     		var actors = [];
     		for (var id in this.wireSegments) {
     			 var wireSegmentObj = this.wireSegments[id];
     			var actor = this.createActor(wireSegmentObj.element, "circuit");
 				if(actor != null) {
 					actors[actor.id] = actor;
 				}
     	    }
     		for (id in this.switches) {
    			 var switchObj = this.switches[id];
    			var actor = this.createActor(switchObj.element, "switch");
				if(actor != null) {
					actors[actor.id] = actor;
				}
    	    }
     		for (id in this.balloons) {
    			var balloonObj = this.balloons[id];
    			var actor = this.createActor(balloonObj.element, "dcballoon");
				if(actor != null) {
					actors[actor.id] = actor;
				}
    	    }
     		return actors;
     	};
     	
     	/**
     	 * Creates an actor depending of its type specified.
     	 * @param element Snap element The DOM element corresponding to the actor to be created
     	 * @param type string The type of the actor
     	 * @returns Object The actor created (WireSegment|DCBalloon|Switch)
     	 */
     	AnimatedWiringDiagram.prototype.createActor = function(element, type) {
     		var actor = null;
     		if(element.attr("id") == null) {
     			return null;
     		}     		
         	if(type == "circuit") {
         		actor = new $.WireSegment(element.attr("id"), this);
         	} else if(type == "switch"){
         		actor = new $.Switch(element.attr("id"), this);
         	} else if(type == "dcballoon") {
         		actor = new $.DCBalloon(element.attr("id"), this);
         	} else {
         		// unknown actor 
         		return null;
         	}  		
     		return actor;
     	};
     	
     	/**
     	 * Collect diagram circuit types
     	 * @returns Map A map with CircuitType objects keyed by type
     	 */
     	AnimatedWiringDiagram.prototype.getCircuitTypes = function() {	
     		var circuitTypes = {};	
     		if(this.circuitTypesData == null || this.circuitTypesData['circuitTypes'].length == 0) { // get default circuit types from file
     			for (var key in circuit_types) {
         			if (circuit_types.hasOwnProperty(key)) {
         				circuitTypes[key] = new $.CircuitType(key, circuit_types[key]['name'], circuit_types[key]['color']);
         				if(!this.isLegacy) {
         					circuitTypes[key].colorBlindBalloonFontColor = circuit_types[key]['colorBlindBalloonFontColor'];
             				circuitTypes[key].colorBlindBalloonText = circuit_types[key]['colorBlindBalloonText'];	
         				}
         			}
         		}
     		} else {
     			for (var i=0; i<this.circuitTypesData['circuitTypes'].length; i++) {
     				var circuitType = this.circuitTypesData['circuitTypes'][i];
     				circuitTypes[circuitType['type']] = new $.CircuitType(circuitType['type'], circuitType['name'], circuitType['color']);
     				if(circuitType['colorBlindBalloonFontColor'] != null) {
     					circuitTypes[circuitType['type']].colorBlindBalloonFontColor = circuitType['colorBlindBalloonFontColor'];
     				}
     				if(circuitType['colorBlindBalloonText'] != null) {
     					circuitTypes[circuitType['type']].colorBlindBalloonText = circuitType['colorBlindBalloonText'];
     				}
					
     			}
     		}
     		return circuitTypes;
     	};
     	
     	/**
     	 * Create and collect the UI Objects corresponding to the wire segment actors
     	 * @returns JS map Map with WireSegmentObject objects keyed by their ids
     	 */
     	AnimatedWiringDiagram.prototype.getWireSegments = function() {
     		var wires = {};
     		if(this.isLegacy) {
     			this.svg.selectAll("g[id^='layer_']").forEach((function(layer) {
     				var layerChildren = layer.children();
     				for (var i = 0; i < layerChildren.length; i++) {
         				var element = layerChildren[i];
         				if(element.attr("id") != null && element.attr("id").split("_")[0] == "circuit") { // wire found!
         					var wireCircuitType = this.circuitTypesToWires[element.attr("id")]; // check custom definitions file
         					if(wireCircuitType == null) {        // if no custom definition is found,
         						var parentId = layer.attr("id"); // get the circuit type from the parent layer id 
         						wireCircuitType = parentId.split('layer' + LABEL_DELIMITER).pop();
         					}
         					var circuitTypeObj = this.circuitTypes[wireCircuitType];
         					var wireSegmObj = new $.WireSegmentObject(this.svg, element, circuitTypeObj, this);
         					wires[element.attr("id")] = wireSegmObj;
         				}
         			}
     			}).bind(this));		
     		} else {
     			this.svg.selectAll("g[id^='"+CIRCUITS_LAYER+"']").forEach((function(wiresLayer) { 
         			if(wiresLayer != null) {
         				wiresLayer.selectAll("g").forEach((function (element) {
         					if(element.parent() == wiresLayer) {
         						var balloonElement = element.select("g");
         						var wireElement = element.select("path, line, polyline");
         						if(wireElement.attr("id") == null) {
                 					// report for missing label and quit
                 				} else {
                 					if(balloonElement != null) {
                 						this.balloonsToWires[wireElement.attr("id")] = balloonElement;
                 					}
                 					var circuitType = this.circuitTypesToWires[wireElement.attr("id")];
                         			if(circuitType != null) {
                         				var circuitTypeObj = this.circuitTypes[circuitType];
                         				var wireSegmObj = new $.WireSegmentObject(this.svg, wireElement, circuitTypeObj, this); 
                         				wires[wireElement.attr("id")] = wireSegmObj;
                         			} else {
                         				var wireSegmObj = new $.WireSegmentObject(this.svg, wireElement, null, this); // if wire ui obj has no circ type then it cannot be highlighted and animated, just the mouse over will work
                         				wires[wireElement.attr("id")] = wireSegmObj;
                         			}
                 				}
         					}
         				}).bind(this));
         				wiresLayer.selectAll("path, line, polyline").forEach((function (element) {
         					if(element.parent() == wiresLayer) {
	         					if(element.attr("id") == null) {
	    	             			// report for missing label and quit
	    	             		} else {
	             					var circuitType = this.circuitTypesToWires[element.attr("id")];
	                     			if(circuitType != null) {
	                     				var circuitTypeObj = this.circuitTypes[circuitType];
	                     				var wireSegmObj = new $.WireSegmentObject(this.svg, element, circuitTypeObj, this); 
	                     				wires[element.attr("id")] = wireSegmObj;
	                     			} else {
	                     				var wireSegmObj = new $.WireSegmentObject(this.svg, element, null, this); // if wire ui obj has no circ type then it cannot be highlighted and animated, just the mouse over will work
	                     				wires[element.attr("id")] = wireSegmObj;
	                     			}
	    	             		}
         					}
         				}).bind(this));         	
         			}
         		}).bind(this));
     		}
     		return wires;
     	};
     	
     	/**
     	 * Create and collect the UI Objects corresponding to the switch actors
     	 * @returns JS map Map with SwitchObject objects keyed by their ids
     	 */
     	AnimatedWiringDiagram.prototype.getSwitches = function() {    	
     		var switches = {}; 
     		if(this.isLegacy) {
     			var switchLayerId = "layer_x005F_switches"; // TODO: hardcoded!
         		var switchLayerElement = this.svg.select("#" + switchLayerId);
         		if(switchLayerElement != null) {
         			var switchElements = switchLayerElement.children();    
         			for (var i = 0; i < switchElements.length; i++) {	
             			var currentSwitch = switchElements[i]; // returns text and path elements
             			if(currentSwitch.type == "g") {
             				var switchObj = new $.SwitchObject(this.svg, currentSwitch, this);
             				switches[currentSwitch.attr("id")] = switchObj;
             			}
             		}
         		}     		
     		} else {
     			this.svg.selectAll("g[id^='"+SWITCHES_LAYER+"']").forEach((function(switchesLayer) { 
         			if(switchesLayer != null) {
         				switchesLayer.selectAll('g').forEach((function(element) {
         					if(element.parent().attr("id") != null && element.parent().attr("id").substring(0, SWITCHES_LAYER.length) == SWITCHES_LAYER) {
         						var currentSwitch = element;
                     			if(currentSwitch.type == "g") {
                     				var switchObj = new $.SwitchObject(this.svg, currentSwitch, this);
                     				switches[currentSwitch.attr("id")] = switchObj;
                     			}
         					}
         				}).bind(this));
         			}
         		}).bind(this));
     		}	
     		return switches;
     	};
     	
     	/**
     	 * Create and collect the UI Objects corresponding to the balloons actors
     	 * @returns JS map Map with DCBalloonObject objects keyed by their ids
     	 */
     	AnimatedWiringDiagram.prototype.getBalloons = function() {
     		var balloons = {};
     		if(this.isLegacy) {
     			var balloonsLayerId =  "layer_x005F_dcballoons"; // TODO: hardcoded!
         		var ballonsLayerElement = this.svg.select("#"+balloonsLayerId);
         		if(ballonsLayerElement != null) {
         			ballonsLayerElement.attr("visibility", "visible");
         			var balloonsElements = ballonsLayerElement.children();
         			for(var i=0; i<balloonsElements.length; i++) {
         				var balloon = balloonsElements[i];
         				if(balloon.type == "g") {
         					var id = balloon.attr("id");
         					if(id != null && id.indexOf("dcballoon_") > -1) {
         						var balloonObj = new $.DCBalloonObject(this.svg, balloon, this);
         						balloons[id] = balloonObj;
         					}
         				}
         			}
         		}
     		}  else {
     			this.svg.selectAll("g[id^='"+DCBALLOOONS_LAYER+"']").forEach((function(switchesBalloon) { 
         			if(switchesBalloon != null) {
         				switchesBalloon.selectAll("g").forEach((function(element) {
         					if(element.parent().attr("id") != null && element.parent().attr("id").substring(0, DCBALLOOONS_LAYER.length) == DCBALLOOONS_LAYER) {
         						var balloon = element;
                     			if(balloon.type == "g") {
                     				var balloonObj = new $.DCBalloonObject(this.svg, balloon, this);
             						balloons[element.attr('id')] = balloonObj;
                     			}
         					}
         				}).bind(this));
         			}
         		}).bind(this));
     		}	
     		return balloons;
     	};
     	
     	/**
     	 * Put the circuit lables (if any) to the top
     	 */
     	AnimatedWiringDiagram.prototype.moveCircuitLabelsToTop = function() {
     		
     		if(this.isLegacy) {
     			var labelsLayerID = "layer_x005F_circuits"; // TODO: hardcoded
         		var labelsLayerElement = this.svg.select("#"+labelsLayerID);
         		if(labelsLayerElement != null) {
         			this.svg.select("#"+labelsLayerID).remove();
         			this.svg.append(labelsLayerElement);
         		}
     		} else {
     			for(var key in this.wireSegmentLabels) {
     				var label = this.wireSegmentLabels[key];
     				var labelElement = label.element;
     				this.svg.select("#"+labelElement.attr("id")).remove();
     				this.svg.append(labelElement);
     			}
     		}
     	};
     	
     	/**
     	 * Create and collect the UI Objects corresponding to the circuit labels (color blind balloons over wires)
     	 */
     	AnimatedWiringDiagram.prototype.createColorBlindBalloons = function() {
     		var hasLabels = false;
     		if(this.isLegacy) {
     			var labelsLayerID = "layer_x005F_circuits"; // TODO: hardcoded
         		var labelsLayerElement = this.svg.select("#"+labelsLayerID);
         		if(labelsLayerElement != null) {
         			labelsLayerElement.selectAll("g[id^='cb_']").forEach((function(baloonElement) {
         				var wireID = baloonElement.attr("id").replace("cb_", "circuit_");
         				var wireSegmentObj = this.wireSegments[wireID];
         				var applyCustomChanges = wireSegmentObj.circuitType == null || this.circuitTypesToWires[wireSegmentObj.id] != null || wireSegmentObj.circuitType.colorBlindBalloonFontColor != null || wireSegmentObj.circuitType.colorBlindBalloonText;
         				var colorBlindBalloon = new $.WireSegmentLabelObject(baloonElement, wireSegmentObj, applyCustomChanges);
         				colorBlindBalloon.hide();
         				wireSegmentObj.label = colorBlindBalloon;
         				this.wireSegmentLabels[wireID] = colorBlindBalloon;
             			hasLabels = true;
         			}).bind(this));
         		}
     		}
     		for(var wireID in this.balloonsToWires) {
     			var balloonElement = this.balloonsToWires[wireID];
     			var wireSegmentObj = this.wireSegments[wireID];
     			var colorBlindBalloon = new $.WireSegmentLabelObject(balloonElement, wireSegmentObj, true);
 				colorBlindBalloon.hide();
     			wireSegmentObj.label = colorBlindBalloon;
     			this.wireSegmentLabels[wireID] = colorBlindBalloon;
     			hasLabels = true;
     		}
     	};
     	
     	/**
     	 * Check if current SVG drawing is in a legacy format
     	 * @return boolean Whether current svg is in a legacy format or not
     	 */
     	AnimatedWiringDiagram.prototype.isSVGLegacy = function() {
    		return this.svg.selectAll("g[id^='"+CIRCUITS_LAYER+"']").length == 0;
    	};
  

