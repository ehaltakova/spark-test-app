/**
 * DCBalloon UI.
 * This is the graphical representation of a voltage balloon in the SVG drawing.
 * 
 * Example:
 * <g id="dcballoon_x005F_17">
 * 	 ...
 *	 <text transform="matrix(0.9343 0 0 1 179.564 768.3896)" enable-background="new">
 *     <tspan x="0" y="0" font-family="'ArialMT'" font-size="13.856">I</tspan>
 *   </text>
 *  </g>
 */
(function ($) { 
	
	/**
	 * DCBalloonObject constructor.
	 * @param svg Snap object The DOM representation of the SVG drawing
	 * @param element Snap object The XML node representing the balloon in the SVG drawing
	 * @param wiringDiagram AnimatedWiringDiagram object The wiring diagram which the balloon belongs to
	 */ 
	$.DCBalloonObject = function (svg, element, wiringDiagram) { 
	
		this.wiringDiagram = wiringDiagram;
		this.svg = svg;
		this.element = element;
		this.id = element.attr("id");

		this.isAuthoring = wiringDiagram.isAuthoring; // True if object is used in SALSSA application (authoring mode), False if it is used in the AWD viewer
		this.appContext = wiringDiagram.appContext; // Context in which the object exists (SlideAlbum in the SALSSA context, WireDiagram in the context of the AWD viewer)
		
		this.textNode = null; // the node holding the text value of the balloon 
		this.slugText = "I";  // Sometimes Illustrator applies multiple <tspan> lines that contain spaces.
							  // The cap-letter 'I' is used to pin-point the center of the balloon object graphic and to
		                      // locate the node that contains the value of the balloon.
	
		this.cssClass = WIRING_ANIMATION_CONSTANTS['dcballoon_text_class'];
		this.visible = null;
		
		if(this.isAuthoring) {
			this.attachMouseEvents(); // attach mouse event handlers to the balloon node
		} else {
			this.element.attr("visibility", "visible");
		}
		this.setTextNode(); // find and set the text node holding the balloon text value
	};

	/**
	 * DCBalloonObject methods
	 */
    $.DCBalloonObject.prototype = {

    	/**
    	 * Attach mouse event handlers to the balloon node:
    	 * - mouseover: change cursor to show the balloon is clickable;
    	 * - mouseout: turn back the cursor when mouse leaves the balloon;
    	 * - click: show the value selection box.
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
    			self.showValuePromptBox();
    		});
    	},
    	
    	/**
    	 * Display the value selection box and update the text node according to the user input (if any).
    	 */
    	showValuePromptBox: function() {
    		var self = this;
    		var message = localize("Enter Balloon value (4 char maximum):");
    		bootbox.prompt({
	      	    'title': message,
	      	    'buttons': {
	      	    	'confirm': {
	      	    		'label': localize('OK')
	      	    	},
	      	    	'cancel': {
	      	    		'label': localize('Cancel')
	      	    	}
	      	    },
	      	    'callback': function(result) {
	      	    	if (result === null) {                                             
	        		} else {
	        			if(result.length > 4) { // validate the value being set
	        				alert(localize("No more than 4 characters. Please try again."));
	        	   			return false;
	        	   		} else {
	            	   		self.setValue(result, true);   
	            	   		if(self.slideAlbum != null && self.slideAlbum.animationsMgr.currentSlideIndex > 1) {
	            	   			self.slideAlbum.isDirty = true;
	            	    	}
	        	   		}
	        	   	}
	      	    }
	      	}); 
        },
    	
        /**
         * Find the text node holding the balloon value and keep a reference to it.
         * NOTE: text node could be found only if in the balloon definition the correct slug text and XML elements are used.
         */
        setTextNode: function() {
        	var self = this;
        	this.element.selectAll("text").forEach(function(textElem) { // it is assumed that there might be more than one <text> element in the balloon definition
    			textElem.attr("class", self.cssClass);
    			textElem.selectAll("tspan").forEach(function(tspanElem) { // iterate the <tspan> children
    				tspanElem.attr("font-family", "Arial");
    				tspanElem.attr("font-size", "6pt");
    				if(tspanElem.node.textContent == self.slugText) {
    					self.textNode = tspanElem;
    				}
    			});
    			// Note: ballon node may not have a tspan 
    			if(self.textNode == null) {
    				var children = textElem.children();
    				for(var i=0; i<children.length; i++) {
    					var childNode = children[i].node;
    					if (((childNode.nodeType == 1) && (childNode.nodeName == "text") && (childNode.nodeValue == self.slugText)) || 
    					   ((childNode.nodeType == 3) && (childNode.nodeName == "#text") && (childNode.nodeValue == self.slugText))) {
    						self.textNode = children[i];
    					}
    				}
    			}
    			// display an error if at the end the text node is not found
    			if(self.textNode == null) {
    				alert(localize("Text node holding the balloon value is not find \n. Please, check if balloon node definition is correct."));
    			}
    		});
        },
        
        /**
         * Set text value to the balloon text node.
         * @param value string The new value of the balloon
         * @param isUserSelection boolean True if user has manually set new value for the balloon, false if it is set automatically by the application (loading a slide/animation for example)
         */
        setValue: function(value, isUserSelection) {
        	
        	// set the new value
        	this.textNode.node.textContent = value; 
        	
        	if(this.isAuthoring) { // only for authoring mode (SALSSA)
        		
        		// update the context
        		var slideAlbum = this.appContext;
        		var notTheLastSlide = slideAlbum.animationsMgr.currentSlideIndex < slideAlbum.animationsMgr.slides.length;
        		var notTheFirstSlide = slideAlbum.animationsMgr.currentSlideIndex > 1;
        		
            	// display Propagate Changes button if it is authoring mode, the user has selected the new value manually and if this is not the last slide
        		if(isUserSelection && notTheLastSlide) {
        			var currentSlide = slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1];
        			var currentActor = currentSlide.actors[this.id];
        			var copiedActor = new $.DCBalloon(this.id, this.wiringDiagram);
        			copiedActor.value = value;
        			currentSlide.isDirty = true;
        			currentSlide.changes[this.id] = copiedActor; //save the change to be propagated by storing the corresponding actor and its state
        			$("#propagateChanges").show(); // show the button
        		} 
        		// update the corresponding balloon actor if it is in authoring mode and it is not the first slide selected
    			if(notTheFirstSlide) {
    				slideAlbum.animationsMgr.slides[slideAlbum.animationsMgr.currentSlideIndex-1].actors[this.id].value = value;
    			}
			}
        },
        
        /**
         * Show the balloon.
         */
        show: function() {
        	this.element.attr("visibility", "visible");
        },
        
        /**
         * Hide the balloon.
         */
        hide: function() {
        	this.element.attr("visibility", "hidden");
        }
    };
}(jQuery));