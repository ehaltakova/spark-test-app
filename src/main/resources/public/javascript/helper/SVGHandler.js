/**
 * SVG Document wrapper.
 * Handle SVG document load and scale together with all SVG specific operations like zoom, pan, etc.
 */	
	SVG = function () {
		
		this.svg = null; // Snap svg document
		this.svgDoc = null; // html svg document
		this.viewBox = null; // inital viewBox
		
		// ZOOM general settings
		this.zoomInStep = 0.9;
		this.zoomOutStep = 1.1;
		
		// PAN general settings
		this.panStep = 3; // default pan step
		
		// ZOOM rectangle controls
		this.rectWidth = null;
		this.mouseDragZoom = false; 
		this.mouseMoveZoom = false;
		this.timeBetweenClick = 0;
		
		// PAN controls
		this.mouseDragPan = false;
		this.panX = -1;
		this.panY = -1;
	};

    	/**
    	 * Initialize actions:
    	 * - create Snap svg object;
    	 * - set id to the SVG document;
    	 * - scale SVG;
    	 * - attach mouse and keyboard event handlers, etc.
    	 */
        SVG.prototype.load = function () {
        	        	
        	this.svg = Snap("#svgObject");
        	this.svg.attr("id", "wiringSVG");
 		    this.svgDoc = document.getElementById("svgObject").contentDocument.getElementById("wiringSVG"); // svg doc as html element
 		    this.viewBox = this.svg.attr("viewBox");    
 		    this.panStep = (this.viewBox.width + this.viewBox.height) / 200; // pan step depends on the viewbox size
 		   		    
 		    this.scaleToScreen();
 		    this.attachContextMenu();
 		    this.addKeyEventsListeners();
 		    this.addMouseEventsListeners();
        };
        
        /**
         * Scale svg to fit the container size
         */
        SVG.prototype.scaleToScreen = function() {
        	
        	var width = this.svg.attr("width");
 		    var height = this.svg.attr("height");
        	var contentWidth = $("#svgContainer").width();      
        	var screenHeight = $(window).height();
        	var contentHeight = screenHeight - 120; // footer and header    
 		    if(height > width) {
 		    	$("#svgObject").attr("height", contentHeight + "px");
 		    	$("#svgObject").attr("width", "100%");
 		    } else {
 		    	$("#svgObject").attr("width", contentWidth + "px");
 		    	$("#svgObject").attr("height", contentHeight + "px");
 		    }			  
	    	$("#svgObject").attr("margin", "0 auto"); // center horizontally
        };
        
        /**
         * Attach custom context menu: zoom in, zoom out, reset
         */
        SVG.prototype.attachContextMenu = function() {
			
        	var self = this;
        	var contextMenu = $("#contextMenu");
			this.svgDoc.addEventListener("contextmenu", function (e) {
				e.preventDefault(); // prevent default context menu to appear
		    	contextMenu.css({
		    		display: "block",
		    		left: e.pageX,
					top: e.pageY
				});
			    return false;
			});
			$("#zoomIn").on("click", function() {
				self.zoomIn();
			});
			$("#zoomOut").on("click", function() {
				self.zoomOut();
			});
			$("#resetZoom").on("click", function() {
				self.resetZoom();
			});
			contextMenu.on("click", "#resetZoom", function() {
				contextMenu.hide();
			});
			contextMenu.on("mouseleave", function() {
				contextMenu.hide();
			});
        };
        
        /**
         * Attach key events listeners to handle Ctrl and Alt key pressed
         */
        SVG.prototype.addKeyEventsListeners = function() {
        	
        	this.svgDoc.addEventListener("keydown", function (e) {
	 			if (e.ctrlKey) {
	 				e.preventDefault();
	 				this.style.cursor = "crosshair";
	 			} else if(e.altKey) {
	 				e.preventDefault();
	 				this.style.cursor = "move";
	 			}
	 		});
	 		  
	 		this.svgDoc.addEventListener("keyup", function (e) {
	 			this.style.cursor = "auto";	    	
			});
        };
        
        /**
         * Attach mouse events listeners to handle zooming and panning
         */
        SVG.prototype.addMouseEventsListeners = function() {
        	        	
        	// mousedown 
        	this.svg.mousedown((function(e) {	
	 			if(e.which != 1) {
	 				return;
	 			}						
				if (e.ctrlKey && !this.mouseDragZoom) {				
			        this.mouseDragZoom = true;
	 				var tranformedPoint = this.transformCoordinates(e.pageX, e.pageY); // get mouse coordinates and transfomr them to svg coordinates
			        var zoomRectWidth = Math.min(this.svg.attr("viewBox").height, this.svg.attr("viewBox").width) / 500;
			        if(zoomRectWidth < 0.001) {
			        	zoomRectWidth = 0.001;
			        }        
			        // draw the zoom rect
			        var zoomRect = this.svg.rect(tranformedPoint.x, tranformedPoint.y, zoomRectWidth, zoomRectWidth, 0, 0).attr({
			            'fill': "none",
			            'stroke': "green",
			            'strokeWidth': 5,
			            'id': "zoomRectangle"
			        });
				} else if (e.altKey && !this.mouseDragPan && e.which == 1) {
					this.mouseDragPan = true;
					this.panX = e.pageX;
					this.panY = e.pageY;
				}
	 		}).bind(this));
	 		
        	// mousemove
	 		this.svg.mousemove((function(e) {
	 			if (this.mouseDragZoom) { 				
	 				this.mouseMoveZoom = true;
	 				var tranformedPoint = this.transformCoordinates(e.pageX, e.pageY); // get mouse coordinates and trnasform them to svg coordinates
	 				// get and update the zoom rectangle
					var zoomRect = this.svg.select("rect[id='zoomRectangle']");
					if(zoomRect != null) {
						var xx = zoomRect.attr('x');
						var yy = zoomRect.attr('y');
						zoomRect.attr('width', (tranformedPoint.x - xx) + "");
						zoomRect.attr('height', (tranformedPoint.y - yy) + "");
						if(tranformedPoint.x < xx) {
							zoomRect.attr('x', tranformedPoint.x + "");
						}
						if(tranformedPoint.y < yy) {
							zoomRect.attr('y', tranformedPoint.y + '');
						}
					}
				} else if (this.mouseDragPan && e.which == 1) {		
					var currentX = e.pageX;
					var currentY = e.pageY;
					if (currentX + this.panStep < this.panX) {
						this.pan("x", "+");
					} else if (currentX - this.panStep > this.panX) {
						this.pan("x", "-");
					}
					if (currentY + this.panStep < this.panY) {
						this.pan("y", "+");
					} else if (currentY - this.panStep > this.panY) {
						this.pan("y", "-");
					}
					this.panX = currentX;
					this.panY = currentY;
				}
				e.preventDefault();
	 		}).bind(this));
	 		
	 		// mouseup
	 		this.svg.mouseup((function() {
	 			if (this.mouseDragPan) {
					this.mouseDragPan = false;
				} else {
					// get and remove the zoom rectangle
					var zoomRect = this.svg.select("rect[id='zoomRectangle']");
					if(zoomRect != null) {
						zoomRect.remove();
					}
					if (this.mouseDragZoom) {
						this.mouseDragZoom = false;					
						// do the actual zoom
						var x = zoomRect.attr('x');
						var y = zoomRect.attr('y');
						var w = zoomRect.attr('width');
						var h = zoomRect.attr('height');
						var svgw = this.viewBox.width;
						var svgh = this.viewBox.height;
						if (svgh < h && this.viewBox.x != x) {
							x = (this.viewBox.x + x) / 2;
							y = (this.viewBox.y + y) / 2;
						}
						if (svgw < w && this.viewBox.y != y) {
							x = (this.viewBox.x + x) / 2;
							y = (this.viewBox.y + y) / 2;
						}
						this.svg.attr({ viewBox: x + " " + y + " " + w + " " + h});		
						this.mouseMoveZoom = false;
					}
				}
	 		}).bind(this));
        };
       
        /**
         * Zoom SVG document
         * @param zoomStep Step of the zoom to indicate whether to zoom in or zoom out 
         */
        SVG.prototype.zoom = function(zoomStep) {
        	
        	// calculate new width and height
	    	var width = this.svg.attr("viewBox").width;
	    	var height = this.svg.attr("viewBox").height;
	    	var newWidth = width * zoomStep;
	    	var newHeight = height * zoomStep;
	    			    
	    	// calculate new x and y
	    	var x = this.svg.attr("viewBox").x;
	    	var y = this.svg.attr("viewBox").x;
	    	var newX = x + width * (1 - zoomStep) / 2;
	    	var newY = y + height * (1 - zoomStep) / 2;
	    	
	    	// set the new viewBox
	    	this.svg.attr({ viewBox: "" + newX + " " + newY + " " + newWidth + " " + newHeight});
        };
    
        /**
         * Zoom SVG document in
         */
    	SVG.prototype.zoomIn = function() {
    		this.zoom(this.zoomInStep);
    	};
        
    	 /**
         * Zoom SVG document out
         */
        SVG.prototype.zoomOut = function() {
    		this.zoom(this.zoomOutStep);
    	};
    	
    	/**
         * Reset SVG document to its original view
         */
    	SVG.prototype.resetZoom = function() {
  	    	this.svg.attr({ viewBox: "" + this.viewBox.x + " " + this.viewBox.y + " " + this.viewBox.width + " " + this.viewBox.height});
      	};
    	
      	/**
      	 * Pan SVG document
      	 * @param axis The coordinate axis (x/y) to indicate wheter to pan up/down or left/right
      	 * @param direction Panning direction (+/-)
      	 */
    	SVG.prototype.pan = function(axis, direction) {
    		
    		var viewBox = this.svg.attr("viewBox");
    		var currentX = viewBox.x;
    		var currentY = viewBox.y;
    		var newX = 0;
    		var newY = 0;
    		
    		if (direction == "-") {
    			newX = currentX - this.panStep;
    			newY = currentY - this.panStep;
    		} else {
    			newX = currentX + this.panStep;
    			newY = currentY + this.panStep;
    		}

    		if (axis == "x") {
    			this.svg.attr({viewBox: "" + newX + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height});
    		} else {
    			this.svg.attr({viewBox: "" + viewBox.x + " " + newY + " " + viewBox.width + " " + viewBox.height});
    		}
    	};
    	
    	/**
    	 * Helper method for getting current point from the screen and translating it to SVG point
    	 * @return transformed point
    	 */
    	SVG.prototype.transformCoordinates = function(x, y) {
    		var matrix = this.svgDoc.getScreenCTM(); // matrix coordinates according to screen
			var point = this.svgDoc.createSVGPoint(); // point
			point.x = x;
			point.y = y;
			var transformed = point.matrixTransform(matrix.inverse());
			return transformed;
    	};
    	
    	/**
    	 * Dynamically add svg stylessheet to the SVG doment element.
    	 */
    	SVG.prototype.loadCss = function(path) {
    	    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
 		    	xmlhttp=new XMLHttpRequest();
 		    }
 		    else { // code for IE
 		    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
 		    }
 		    xmlhttp.onload = (function() {
 		    	var styleElem = document.getElementById("svgObject").contentDocument.createElementNS("http://www.w3.org/1999/xhtml", "style");
	 		    styleElem.textContent = xmlhttp.responseText;
	 		    this.svgDoc.appendChild(styleElem);          
 		    }).bind(this);

 		    xmlhttp.open("GET", path + "/svg_etm.css", false);
 		    xmlhttp.send();    
    	};
