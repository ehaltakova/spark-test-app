/**
 * DCBalloon Actor.
 * This is the logical representation of a voltage balloon in the terms of the wiring animation diagram.
 * Voltage balloons represent  the circuit voltage at current moment.
 * 
 * The DCBalloon actor is characterized by the follwoing properties in the wiring diagram:
 * - a unique identifier (id/label);
 * - a text value (state) being displayed in the diagram.
 * Object of animation is the state of the ballon, i.e. its text value.
 */
(function ($) { 
	
	/**
	 * DCBalloon object constructor.
	 * @param id string The unique identifier of the balloon actor
	 * @param wireDiagram AnimatedWiringDiagram object The wiring diagram which the balloon actor belongs to
	 * @return DCBalloon object
	 */
	$.DCBalloon = function(id, wireDiagram) {
		this.wireDiagram = wireDiagram;
		this.id = id;
		this.value = "***"; // default value
	};

	/**
	 * DCBalloon Actor methods
	 */
    $.DCBalloon.prototype = {
    	
    	/**
    	 * Returns the DCBalloon actor XML representation.
    	 * @return string Balloon actor XML definition
    	 */
    	toXmlString: function() {
    		// NOTE: legacy
    		return '<dcballoon id="' + this.id + '" state="' + this.value + '" />'; 
    	},
    	
    	/**
    	 * Returns the DCBalloon actor JS representation.
    	 * @return string Balloon actor JS definition
    	 */
    	toJsString: function() {
    		// NOTE: legacy
    		return "colVoltageBalloons.getBalloon('" + this.id + "').setValue('" + this.value +"');"
    	},
    	
    	/**
    	 * Visualze the animation state of the balloon actor. 
    	 */
    	showAnimation: function() {
    		var balloonObject = this.wireDiagram.balloons[this.id]; // get the UI object corresponding to te balloon actor
    		balloonObject.setValue(this.value, false); 
    	}
    };

}(jQuery));