/** 
 * Boolean variable indicating whether the browser supports the SMIL_ANIMATIONS
 * Check is done by trying to create SMIL animation object and checking the DOM for it.
 */
 var SMIL_SUPPORT = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'animateMotion'
      ).toString().toLowerCase().indexOf('animate') > -1;
      
var ILLUSTRATOR_LABEL_DELIMITER = '_x005F_';

var WIRING_ANIMATION_CONSTANTS = 
{
	'circuit_type_layer_id_prefix': 'layer' + ILLUSTRATOR_LABEL_DELIMITER, // circuit types
	'circuit_type_highlight_class': 'CircuitHighlighting',
	'dcballoon_text_class': 'DCVoltageBalloonsText', // balloons 
	'switch_group_highlight_id': 'mouse' + ILLUSTRATOR_LABEL_DELIMITER  + 'switchpos', // switches
	'switch_position_selected_class': 'SwitchPosSelected',
	'switch_position_mouseout_class': 'SwitchPosMouseOut',
	'switch_position_mouseover_class': 'SwitchPosMouseOver',
	'switch_position_index_delimiter': '_',
	'wire_segment_flow_class': 'CircuitCurrentFlow', // wire segments
	'wire_segment_mouseout_class': 'WireSegmentMouseOut',
	'wire_segment_mouseover_class': 'WireSegmentMouseOver', 
	'SALSSA2_label_delimiter': ILLUSTRATOR_LABEL_DELIMITER, // new SVG format
	'SALSSA2_circuits_layer': 'layerWires',
	'SALSSA2_wire_label_prefix': 'circuit',
	'SALSSA2_switches_layer': 'layerSwitches',
	'SALSSA2_switch_label_prefix': 'switch',
	'SALSSA2_dcballoons_layer': 'layerDcballoons',
	'SALSSA2_dcballoon_label_prefix': 'dcballoon',
};

var circuit_types = 
{
	"battery": {"name": localize("Battery Feed"), "color": "red", "colorBlindBalloonFontColor" : "white", "colorBlindBalloonText":"B"},
	"swbattery": {"name": localize("Switched Battery Feed"), "color": "green", "colorBlindBalloonFontColor" : "white", "colorBlindBalloonText":"S"},
	"refvoltage": {"name": localize("Reference Voltage"), "color": "orange", "colorBlindBalloonFontColor" : "black", "colorBlindBalloonText":"R"},
	"grounds": {"name": localize("Ground"), "color": "brown", "colorBlindBalloonFontColor" : "white", "colorBlindBalloonText":"G"},
	"inputs": {"name": localize("Input Signal"), "color": "yellow", "colorBlindBalloonFontColor" : "black", "colorBlindBalloonText":"I"},
	"outputs": {"name": localize("Output Signal/Control Circuit"), "color": "purple", "colorBlindBalloonFontColor" : "white", "colorBlindBalloonText":"O"},
	"databus": {"name": localize("Data Bus Connection"), "color": "blue", "colorBlindBalloonFontColor" : "white", "colorBlindBalloonText":"D"},
	"swgrounds": {"name": localize("Switched Ground"), "color": "#C0C0C0", "colorBlindBalloonFontColor" : "black", "colorBlindBalloonText":"Z"},
};
