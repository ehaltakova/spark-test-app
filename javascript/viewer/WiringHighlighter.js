/**
 * Wiring Highlighter.
 */	
	/**
	 * WiringHighlighter constructor
	 */
	WiringHighlighter = function (svg, path, diagramId, wireSegments) {
		
		this.svg = svg; 
		this.wireSegments = wireSegments; 
		this.path = path;
		this.diagramId = diagramId;
		this.highlightElementsMap = {};
		this.complementaryElements = [];
		this.drawingElements = [];
		
		this.highlighter_config = null;
		
		this.width = null;
		this.intensity = null;
		this.highlightColor = null;
		this.clickColor = null;
		this.step = 1;
		
		// load config
		this.loadConfig();
	};


    	WiringHighlighter.prototype.init = function() {
    		    		
    		// add tooltips to the buttons
    		$("#increaseWidth").attr("title", localize("Increase Highlighter Width"));
    		$("#decreaseWidth").attr("title", localize("Decrease Highlighter Width"));
    		$("#increaseIntensity").attr("title", localize("Increase Highlighter Intensity"));
    		$("#decreaseIntensity").attr("title", localize("Decrease Highlighter Intensity"));
    		$("#showHide").attr("title", localize("Show/Hide non-selected wires"));
    		$("#changeColor").attr("title", localize("Change Highlighter Color"));
    		$("#resetHighlights").attr("title", localize("Reset Highlights"));
    		$("#saveHighlights").attr("title", localize("Save Highlights"));

    		// pre-select settings from cookie
    		var highlighterSetting = {};
    		var cookie = getCookie('highlighterSettings_'+this.diagramId);
    		if(cookie !== null && cookie != '') {
    			highlighterSetting = JSON.parse(cookie);
    			this.width = highlighterSetting['width'];
    			this.intensity = highlighterSetting['intensity'];
    			this.highlightColor = highlighterSetting['highlightColor'];
    			this.clickColor = highlighterSetting['clickColor'];
    		}
    		
    		var self = this;
    		if(this.wireSegments == null ) { // use stroke-widht to find wires and coplementary elements
    			this.wireSegments = this.collectWires();
    		} else {
    			//this.drawingElements = this.collectVisualWires(); // wires are not allways the visual elements, so we need to collect those for the show/hide functionality
    			//this.complementaryElements = this.collectComplementaryElements(); 
    			this.initGraphicElements();
    		}
    		for(var key in this.wireSegments) {
    		    var wireSegmentElement = this.wireSegments[key];
    			this.createHighlightElement(wireSegmentElement);
    		}
    		
    		$("#resetHighlights").on('click', function() {
    			self.resetHighlights();
    		});
    		$("#saveHighlights").on('click', function() {
    			self.saveHighlights();
    		});
    		$("#increaseWidth").on('click', function() {
    			self.increaseWidth();
    		});
    		$("#decreaseWidth").on('click', function() {
    			self.decreaseWidth();
    		});
    		$("#increaseIntensity").on('click', function() {
    			self.increaseIntensity();
    		});
    		$("#decreaseIntensity").on('click', function() {
    			self.decreaseIntensity();
    		});
    		$("#showHide").on('click', function() {
    			self.showHide();
    		});
    		$("#changeColor").on('click', function() {
    			self.changeColor();
    		});
    		
    		$('input:radio[name="highlighterRadio"]').change(function(){
    			if ($(this).is(':checked')) {
    				self.clickColor = $(this).val();
    			}
    		});
    		$('input:radio[name="mouseoverRadio"]').change(function(){
    			if ($(this).is(':checked')) {
    				self.highlightColor = $(this).val();
    			}
    		});
    		    		
    		// pre-select color radio groups
    		$("input[name=mouseoverRadio][value=" + this.highlightColor + "]", '#highlightColor').attr('checked', 'checked');
    		$("input[name=highlighterRadio][value=" + this.clickColor + "]", '#clickColor').attr('checked', 'checked');
    		
    	}
    	
    	WiringHighlighter.prototype.loadConfig = function() {
//    		var self = this;
//    		console.log(this.path + "/highlighter_config.json");
//			$.getJSON(this.path + "/highlighter_config.json", function(json) {
//				console.log(json)
//
//				self.highlighter_config = JSON.parse(json);
//				self.width = self.highlighter_config.uiOptions.strokeWidth;
//				self.intensity = self.highlighter_config.uiOptions.strokeOpacity;
//				self.highlightColor = self.highlighter_config.uiOptions.highlightColor;
//				self.clickColor = self.highlighter_config.uiOptions.clickColor;
//				self.init();
//			});
    	
    		var self = this;
    	    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
 		    	xmlhttp=new XMLHttpRequest();
 		    }
 		    else { // code for IE
 		    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
 		    }
 		    xmlhttp.onload = function() {
 		    	self.highlighter_config = JSON.parse(xmlhttp.responseText);
 		    	self.width = self.highlighter_config.uiOptions.strokeWidth;
 		    	self.intensity = self.highlighter_config.uiOptions.strokeOpacity;
 		    	self.highlightColor = self.highlighter_config.uiOptions.mouseOverColor;
 		    	self.clickColor = self.highlighter_config.uiOptions.highlighterColor;
 		    	if(self.highlighter_config.uiOptions.step != null && self.highlighter_config.uiOptions.step != "") {
 		    		self.step = self.highlighter_config.uiOptions.step;
 		    	}
 		    	self.init();
 		    }

 		    xmlhttp.open("GET", this.path + "/highlighter_config.json", false);
 		    xmlhttp.send();    
    	}
    
    	WiringHighlighter.prototype.collectWires = function() {
 
    		var self = this;
    		var count = 0;
    		var wires = {};
    		this.svg.selectAll("path, line, polyline").forEach(function (wireElement) {
    			var strokeWidth = wireElement.attr('stroke-width');    	
    			if(strokeWidth != null) {
    				strokeWidth = strokeWidth.replace("px", "");
					var wireID = wireElement.attr("id");
    				if($.inArray(strokeWidth, self.highlighter_config.strokeWidth) > -1) {
        				if(wireID == null) {
        					var id = "";
        					if(wireElement.type == 'path') {
        		    			var d = wireElement.attr("d");
        		    			id = d.toString();
        		    		} else if(wireElement.type == 'line') {
        		    			var y1 = wireElement.attr("y1");
        		    			var x1 = wireElement.attr("x1");
        		    			var y2 = wireElement.attr("y2");
        		    			var x2 = wireElement.attr("x2");
        		    			id = "" + x1 + x2 + y1 + y2;
        		    		} else if(wireElement.type == 'polyline') {
        		    			var points = wireElement.attr("points");
        		    			id = points.toString(); 
        		    		}
        					wireElement.attr("id", id);
							wireID = id;
        				}
        				// be careful with the animation fake elements!
						var gParent = wireElement.parent();
						var gParentId = gParent.attr("id");
        				if(gParentId == null || (!startsWith(gParentId, "flow_") && !startsWith(gParentId, "circType_") && !startsWith(gParentId, "highlight_"))) { 
	        				count++;
	    					wires[wireElement.attr("id")] = wireElement;
        				}
    				} else if($.inArray(strokeWidth, self.highlighter_config.complementaryElementsWidth) > -1) {
    					self.complementaryElements.push(wireElement);
    				}
    			}
    		});   
			console.log(wires);
    		return wires;
    	}
    	
    	WiringHighlighter.prototype.initGraphicElements = function() {
    		
    		var self = this;
    		var wireStrokeWidth = this.highlighter_config.strokeWidth;
    		this.drawingElements = this.svg.selectAll(
    				"path[stroke-width='" + wireStrokeWidth + "'], " +
    				"line[stroke-width='" + wireStrokeWidth + "'], " +
    				"polyline[stroke-width='" + wireStrokeWidth + "']");
    		
    		for(var i=0; i<this.highlighter_config.complementaryElementsWidth.length; i++) {
    			var backgroundStrokeWidth = this.highlighter_config.complementaryElementsWidth[i];
    			var temp = this.svg.selectAll(
        				"path[stroke-width='" + backgroundStrokeWidth + "'], " +
        				"line[stroke-width='" + backgroundStrokeWidth + "'], " +
        				"polyline[stroke-width='" + backgroundStrokeWidth + "']").forEach(function(elem) {
        					self.complementaryElements.push(elem);
        			});
    		}
    	}
    	
    	WiringHighlighter.prototype.collectVisualWires = function() {
    		
    		var graphicElements = this.svg.selectAll(
    				"path[stroke-width='" + this.highlighter_config.strokeWidth + "'], " +
    				"line[stroke-width='" + this.highlighter_config.strokeWidth + "'], " +
    				"polyline[stroke-width='" + this.highlighter_config.strokeWidth + "']");
    		
    		return graphicElements;
    	}
    	
    	WiringHighlighter.prototype.collectComplementaryElements = function() {
    		
    		var self = this;
    		var backgroundElements = [];
    		this.svg.selectAll("path, line, polyline").forEach(function (wireElement) {
    			var strokeWidth = wireElement.attr('stroke-width');    	
    			if(strokeWidth != null) {
    				strokeWidth = strokeWidth.replace("px", "");
    				if($.inArray(strokeWidth, self.highlighter_config.strokeWidth) > -1) {
    					// nothing - this is a wire segment
    				} else if($.inArray(strokeWidth, self.highlighter_config.complementaryElementsWidth) > -1) {
    					backgroundElements.push(wireElement);
    				}
    			}
    		});
    		
//    		var backgroundElements = [];
//    		var strokeWidth = this.highlighter_config.strokeWidth;
//    		for(var i=0; i<this.drawingElements.length; i++) {
//    			var wireGrpahicElement = this.drawingElements[i];
//    			if(wireGrpahicElement.type == "path") {
//	    			var dAttr = wireGrpahicElement.attr("d");
//	    			this.svg.selectAll("path[d='"+dAttr+"']").forEach(function(el) {
//	    				var strokeW = el.attr("stroke-width").replace("px", "");
//	    				if(strokeW != strokeWidth) {
//		    				backgroundElements.push(el);
//	    				}
//	    			});
//    			}
//    			if(wireGrpahicElement.type == "polyline") {
//	    			var pointsAttr = wireGrpahicElement.attr("points");
//	    			this.svg.selectAll("polyline[points='"+pointsAttr+"']").forEach(function(el) {
//	    				var strokeW = el.attr("stroke-width").replace("px", "");
//	    				if(strokeW != strokeWidth) {
//		    				backgroundElements.push(el);
//	    				}
//	    			});
//    			}
//    			if(wireGrpahicElement.type == "line") {
//    				var x1 = wireGrpahicElement.attr("x1");
//        			var x2 = wireGrpahicElement.attr("x2");
//        			var y1 = wireGrpahicElement.attr("y1");
//        			var y2 = wireGrpahicElement.attr("y2");
//	    			this.svg.selectAll("line[x1='" + x1 + "'][x2='" + x2 + "'][y1='" + y1 + "'][y2='" + y2 + "']").forEach(function(el) {
//	    				var strokeW = el.attr("stroke-width").replace("px", "");
//	    				if(strokeW != strokeWidth) {
//		    				backgroundElements.push(el);
//	    				}
//	    			});
//    			}
//    		}
    		
    		return backgroundElements;
    	}
    	
    	WiringHighlighter.prototype.createHighlightElement = function(wireElement) {
    		
    		// highlight pre-selected wires
    		
    		var highlightedWires = {};
    		var cookie = getCookie('highlightedWires_'+this.diagramId);
    		if(cookie !== null && cookie != '') {
    			highlightedWires = JSON.parse(cookie);
    		}
    		
    		var self = this;
    		var highlighElement = null;
    		var attributes = {
    			'id': wireElement.attr("id"),
     		    'fill' : 'none',
     		    'visibility' : "visible",
     		    'stroke-opacity' : "0.0",
     		    'stroke-width' : this.width
    		}
    		
    		if(wireElement.type == 'path') {
    			var d = wireElement.attr("d");
    			highlighElement = this.svg.path(d).attr(attributes).attr("pointer-events", "visibleStroke");
    		} else if(wireElement.type == 'line') {
    			attributes.y1 = wireElement.attr("y1");
    			attributes.x1 = wireElement.attr("x1");
    			attributes.y2 = wireElement.attr("y2");
    			attributes.x2 = wireElement.attr("x2");
    			highlighElement = this.svg.line().attr(attributes).attr("pointer-events", "visibleStroke");
    		} else if(wireElement.type == 'polyline') {
    			var points = wireElement.attr("points");
    			var pointsNoEmpty = [];
    			for(var i=0; i<points.length; i++) {
    				if(points[i] != "") {
    					pointsNoEmpty.push(points[i]);
    				}
    			}
    			highlighElement = this.svg.polyline(pointsNoEmpty).attr(attributes).attr("pointer-events", "visibleStroke");
    		}
    		this.svg.append(highlighElement);

    		var id = wireElement.attr("id");
    		var highlightObject = new HighlightElement(id, highlighElement, attributes);
    		this.highlightElementsMap[id] = highlightObject;
    		
    		// pre-select from cookie
    		if(highlightedWires[id] != null) {
    			highlightObject.selected = true;
    			highlightObject.highlightColor = highlightedWires[id];
    			highlighElement.attr("stroke", highlightObject.highlightColor);
    			highlighElement.attr("stroke-opacity", self.intensity);
    			highlighElement.attr("stroke-width", self.width);
    		}
    		
    		highlighElement.mouseover(function () {
    			highlighElement.attr("stroke", self.highlightColor);
    			highlighElement.attr("stroke-opacity", self.intensity);
    			highlighElement.attr("stroke-width", self.width);
    		});
    		
    		highlighElement.mouseout(function () {
    			if(!highlightObject.selected) {
        			highlighElement.attr("stroke-opacity", "0.0");
    			} else {
    				highlighElement.attr("stroke", highlightObject.highlightColor);
    			}
    		});
    		
    		highlighElement.click(function () {
    			highlightObject.selected = !highlightObject.selected;
    			highlightObject.highlightColor = self.clickColor;
    			if(highlightObject.selected) {
    				highlighElement.attr("stroke", highlightObject.highlightColor);
        			highlighElement.attr("stroke-opacity", self.intensity);
        			highlighElement.attr("stroke-width", self.width);
    			} else {
        			highlighElement.attr("stroke-opacity", "0.0");
    			}
    		});
    	}
    
    	WiringHighlighter.prototype.resetHighlights = function() {
    		for(var key in this.highlightElementsMap) {
			  var current = this.highlightElementsMap[key];
			  if(current.selected) {
				  current.selected = false;
				  for(var property in current.attributes) {
					  current.element.attr(property, current.attributes[property]);
				  }
			  }
			} 
    	}
    	
    	WiringHighlighter.prototype.saveHighlights = function() {
    		
    		// save highlighter settings
    		var cookieExpTime = this.highlighter_config.cookieExpTimeinDays;
    		var highlighterSettings = {'highlightColor' : this.highlightColor, 'clickColor' : this.clickColor, 'width' : this.width, 'intensity' : this.intensity};
    		setCookie('highlighterSettings_'+this.diagramId, JSON.stringify(highlighterSettings), cookieExpTime);
    		
    		// save highlighted wires {'id_1' : 'red', 'id_2' : 'blue', etc.}
    		var highlightedWires = {};
    		for(var key in this.highlightElementsMap) {
    			var wire = this.highlightElementsMap[key];
    			if(wire.selected) {
    				highlightedWires[key] = wire.highlightColor;
    			}
    		}
    		setCookie('highlightedWires_'+this.diagramId, JSON.stringify(highlightedWires), cookieExpTime);
    	}
    	
    	WiringHighlighter.prototype.increaseWidth = function() {
    		var newWidth = (parseFloat(this.width) + this.step) + "";
    		this.width = newWidth;
    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(current.selected) {
    				current.element.attr("stroke-width", newWidth);
    			}
    		} 
    	}
    	
    	WiringHighlighter.prototype.decreaseWidth = function() {
    		var newWidth = (parseFloat(this.width) - this.step) + "";
    		this.width = newWidth;
    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(current.selected) {
    				current.element.attr("stroke-width", newWidth);
    			}
    		} 
    	}
    	
    	WiringHighlighter.prototype.increaseIntensity = function() {
    		var newIntensity = (parseFloat(this.intensity) + 0.1) + "";
    		this.intensity = newIntensity;
    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(current.selected) {
    				current.element.attr("stroke-opacity", newIntensity);
    			}
    		} 
    	}
    	
    	WiringHighlighter.prototype.decreaseIntensity = function() {
    		var newIntensity = (parseFloat(this.intensity) - 0.1) + "";
    		this.intensity = newIntensity;
    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(current.selected) {
    				current.element.attr("stroke-opacity", newIntensity);
    			}
    		} 
    	}
    	
    	WiringHighlighter.prototype.showHide = function() {

    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(!current.selected) {
    				if(current.element.attr("visibility") == "" || current.element.attr("visibility") == "visible") {
  	  					current.element.attr("visibility", "hidden");
  	  					this.wireSegments[current.id].attr("visibility", "hidden");
  	  			  	} else {
  	  			  		current.element.attr("visibility", "visible");
  	  			  		this.wireSegments[current.id].attr("visibility", "visible");
  	  			  	}  
  			  	}
  			}
    		
    		// complementary elements (backgrounds, tracers, etc)
    		for(var i=0; i<this.complementaryElements.length; i++) {
    			var el = this.complementaryElements[i];
    			if(el.attr("visibility") == "" || el.attr("visibility") == "visible") {
    				el.attr("visibility", "hidden");
	  			} else {
	  				el.attr("visibility", "visible");
	  			}  
    		}
    		
    		// complementary elements (backgrounds, tracers, etc)
    		for(var j=0; j<this.drawingElements.length; j++) {
    			var el = this.drawingElements[j];
    			if(el.attr("visibility") == "" || el.attr("visibility") == "visible") {
    				el.attr("visibility", "hidden");
	  			} else {
	  				el.attr("visibility", "visible");
	  			}  
    		}
    	}
    	
    	WiringHighlighter.prototype.changeColor = function() {
    		var highlightColor = $('input[name=mouseoverRadio]:checked', '#highlightColor').val();
    		var clickColor = $('input[name=highlighterRadio]:checked', '#clickColor').val();
    		for(var key in this.highlightElementsMap) {
    			var current = this.highlightElementsMap[key];
    			if(current.selected) {
    				current.highlightColor = clickColor;
    				current.element.attr("stroke", clickColor);
    			}
    		} 
    	}
    	
    	WiringHighlighter.prototype.removeHighlightElements = function() {
    		for(key in this.highlightElementsMap) {
    			this.highlightElementsMap[key].element.remove();
    		}
    		this.highlightElementsMap = {};
    		this.drawingElements = [];
    		this.complementaryElements = [];
    		this.wireSegments = {};
    	}

    /**
     * Highlight Element.
     */
    	
    	/**
    	 * HighlightElement
    	 */
    	HighlightElement = function (id, element, attributes) {
    		this.id = id;
    		this.element = element;
    		this.attributes = attributes;
    		
    		this.selected = false;
    		
    		this.highlightColor = attributes.stroke;
    		this.highlightIntentisty = attributes.strokeOpacity;
    		this.highlightWidth = attributes.strokeWidth;
    	};

    	
function startsWith(str, prefix) {
  return str.indexOf(prefix) === 0;
};