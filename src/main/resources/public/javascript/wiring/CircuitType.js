/**
 * Circuit Type.
 * 
 * A circuit type is a wiring segment characteristic defining the type of the circuit to which the wire belongs to.
 * Wire segments of the same circuit type are indicated with a specific color corresponding to the particualr circuit type.
 * Circuit types could be configurable per application installation (wiring_animation_constants.js file)
 * or to be defined by the application users via GUI.
 * User-defined circuit types are saved in a JSON file.
 * 
 * Circuit type could be defined for a wire in two ways:
 * - SALSSA1: in the SVG drawing, represented by a separate layer element holding the wires of the given circuit type
 * 			  and having id = the name of the circuit type layer. This definition is done outside the SALSSA tool.
 * - SALSSA2: in a separate json resource file, holding wire-circuit type mapping defined manually (via UI) by the SALSSA2 user.
 */
(function ($) { 
	/**
	 * Circuit Type object constructor.
	 * @param type string Short name of the circuit type (e.g. "battery")
	 * @param name string Full name of the circuit type, displayed in the Legend Menu (e.g. "Battery Feed")
	 * @param color string The color of the circuits of the given circuit type in the wiring diagram
	 * @return CircuitType object
	 */
	$.CircuitType = function (type, name, color) {
		this.type = type;
		this.name = name; 
		this.color = color;
		
		// circuit highlight properties
		this.highlightGroupId = "highlight" + ILLUSTRATOR_LABEL_DELIMITER + this.type; // the label of the fake parent group layer
																					   // created on the fly for each circuit type to group the wire elements
																					   // capturing the mouse events, e.g. e.g. "highlight_x005F_<circ_type>"
		this.highlightColor = this.color;
		this.highlightClass = WIRING_ANIMATION_CONSTANTS['circuit_type_highlight_class'];
			
		// The label of the layer grouping the circuits of the given type in the wiring diagram,
		// i.e. the id of the layer element representing the circuit type group, containing wires in the SVG:
		// <g id="layer_x005F_battery">
		// ... 
		// wires elements here
		// ...
		// </g>
		// NOTE: valid only for the legacy SVG format where wires are grouped in separate circuit types layers
		this.circuitTypeGroupId = WIRING_ANIMATION_CONSTANTS['circuit_type_layer_id_prefix'] + this.type; // e.g. "layer_x005F_<circ_type>";
	
		this.colorBlindBalloonFontColor = null; // font color for the text of the color-blind balloons (if any) for this circuit type
		this.colorBlindBalloonText = null; // text of the color-blind balloons (if any) for this circuit type
	
		this.hasWires = false;
	}; 

}(jQuery));
