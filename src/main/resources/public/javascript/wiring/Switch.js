/**
 * Switch Actor.
 * This is the logical representation of an electrical switch in the terms of the wiring animation diagram with
 * its possible positions being turned on and off.
 * 
 * The switch actor is characterized by the follwoing properties in the wiring diagram:
 * - a unique identifier (id/label);
 * - current position being turned on.
 * Object of animation is the state of the switch, i.e. which position is currently turned on.
 */
(function ($) { 
	
	/**
	 * Switch object constructor.
	 * @param id string The unique identifier of the switch actor
	 * @param wireDiagram AnimatedWiringDiagram object The wiring diagram which the switch actor belongs to
	 * @return Switch object
	 */
	$.Switch = function (id, wireDiagram) {
		this.wireDiagram = wireDiagram;
		this.id = id;
		this.position = "none"; // current enabled position (not initialized)
	};
	
	/**
	 * Switch Actor methods
	 */
    $.Switch.prototype = {
    	
    	/**
         * Returns the Switch actor XML representation.
         * @return string Swtich actor XML definition
         */    		
    	toXmlString: function() {
    		// NOTE: legacy
    		return '<switch id="' + this.id + '" state="' + this.position + '" />'; // Note: <switch> tag is reserved in SVG, not XML.
    	},
    	
    	/**
         * Returns the Switch actor JS representation.
         * @return string Swtich actor JS definition
         */   
    	toJsString: function() {
    		// NOTE: legacy
    		return "colSwitches.getSwitch('" + this.id + "').setValue('" + this.position + "');";
    	},
    	
    	/**
    	 * Visualze the animation state of the switch actor. 
    	 */
    	showAnimation: function() {
    		var switchObject = this.wireDiagram.switches[this.id]; // get the corresponding UI object
    		switchObject.setSelectedPositionValue(this.position, false);
    	}
    };

}(jQuery));
