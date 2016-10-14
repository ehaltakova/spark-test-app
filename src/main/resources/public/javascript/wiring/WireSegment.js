/**
 * WireSegment Actor.
 * It represent an electrical circuit in the wiring diagram wchich could be energized or not.
 * This is the logical representation of an electrical circuit in the wiring diagram wchich could be energized or not
 * and show the energy direction.
 * 
 * The wire segment actor is characterized by the follwoing properties in the wiring diagram:
 * - a unique identifier (id/label);
 * - state: (cold|hot|flow)
 * - direction of the electricity flow: (+|-|null)
 * - circuit type
 * Object of animation is the state of the wiring segment, i.e. if it is hot, cold or flow.
 */
(function ($) { 
	
	/**
	 * Wiring segment object constructor.
	 * @param id string The unique identifier of the wire actor
	 * @param wireDiagram AnimatedWiringDiagram object The wiring diagram which the wire actor belongs to
	 * @return WireSegment object
	 */
	$.WireSegment = function (id, wireDiagram) {
		this.wireDiagram = wireDiagram;
		this.id = id;
		this.state = "cold";
		this.flowDirection = null;
		this.circuitType = null;
	};

	/**
	 * Wire Segment Actor methods
	 */
    $.WireSegment.prototype = {
    	
    	/**
        * Returns the WireSegment actor XML representation.
        * @return string WireSegment actor XML definition
        */  	
    	toXmlString: function() {
    		// NOTE: legacy
    		return "<circuit id='" +  this.id + + "' state='" & this.state + "' direction='" + this.flowDirection + "'" + "/>";
    	},
    	
    	/**
         * Returns the WireSegment actor JS representation.
         * @return string WireSegment actor JS definition
         */  
    	toJsString: function() {
    		// NOTE: legacy
    		var jsStr = "colWireSegments.getWireSegment('" + this.id + "')";
    		switch(this.state) {
    			case "cold":
    				jsStr += ".makeCold();";
    				break;
    			case "hot":
    				jsStr += ".makeHot();";
    				break;
    			case "flow":
    				jsStr += ".makeFlow(" + this.flowDirection + ");";
    				break;
    		}
    		return jsStr;
    	},
    	
    	/**
    	 * Visualize the animation state of the wire actor 
    	 */
    	showAnimation: function() {
    		var wireObject = this.wireDiagram.wireSegments[this.id]; // get the corresponding UI object
    		if(this.state == "cold") {
    			wireObject.makeCold(false);
			} else if(this.state == "hot") {
				wireObject.makeHot(false);
			} else if(this.state == "flow") {
				wireObject.makeFlow(this.flowDirection, false);
			}
    	}
    };

}(jQuery));