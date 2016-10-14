/**
 * Wire Diagram Manager.
 * Handle all slide album related operations.
 */	
	/**
	 * WireDiagram constructor
	 */
	WireDiagramMgr = function () {
		this.title = null;
		this.customer = null;
		this.file = null;
		this.animationData = null;
		this.circuitTypesData = null;
		this.svgFileURL = null;
	};

	/**
	 * SlideAlbumMgr methods
	 */

    	/**
    	 * Retrive and store all the information about the slide album from server:
    	 * - slide album properties
    	 * - wiring diagram file (URL/content)
    	 * - animation data
    	 * - circuit type definitions
    	 * Force wiring diagram SVG file loading.
    	 */
        WireDiagramMgr.prototype.openWireDiagram = function (title, customer, file) {    
        	this.title = title;
        	this.customer = customer;
        	this.file = file;
   			this.svgFileURL = encodeURI('../' + file);

   			this.getAnimationData();
   			this.loadJSON();
   			
   			this.loadDiagram(); 
        }
                
        /**
         * Get the svg drawing file/content and call the embed method.
         * Manage readonly/editable modes.
         */
        WireDiagramMgr.prototype.loadDiagram = function() {	
			if(this.svgFileURL != null) {
				this.embedDiagram(this.svgFileURL);
			} 
    	}
    	
    	// embed svg as file
        WireDiagramMgr.prototype.embedDiagram = function(url) {   
        	var self = this;		
			// embed the svg
			$("#svgContainer").html('<object id="svgObject" type="image/svg+xml" data="' + url + '"></object>');	
    		$("#svgObject").on("load", function(){
    			 var svg = new SVG();
    			 svg.load();
    			 var wireDiagram = new WireDiagram(svg, self.title, self.customer, self.svgFileURL, self.animationData, self.circuitTypesData);
    			 wireDiagram.init();
    			 var arr = self.svgFileURL.split('/');
    			 var customer = arr[arr.length-3];
    			 var workspacePath = config['workspace_folder_path'];
    			 var path = "../" + workspacePath + "/" + customer;
    			 svg.loadCss(path);
		    });
    	}
    	
    	WireDiagramMgr.prototype.getAnimationData = function() {
    		
    		var self = this;
    		
    		if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            }
            else { // code for IE
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.onload = function() {
            
            	var xmlDoc = new DOMParser().parseFromString(xmlhttp.responseText,'text/xml');
            
            	var animationData = {};
            	
            	var albumTitleNode= xmlDoc.getElementsByTagName("albumtitle")[0];
                if(albumTitleNode!= null && albumTitleNode.childNodes != null && albumTitleNode.childNodes[0] != null) {
                    $("#wireDiagramAnimationsPanelHeading").html("<b>" + albumTitleNode.childNodes[0].nodeValue + "</b>");
                    animationData.albumtitle = albumTitleNode.childNodes[0].nodeValue;
                }
                
                var slides = xmlDoc.getElementsByTagName("slide");
                animationData.slides = [];
                for (var index=0; index<slides.length; index++) { 
                	
                	var animSlide = {};
                	var slide = slides[index];
    				
                	var slideID = slide.getAttribute("id");
    				animSlide.id = slideID;
    				
    				var slideTitle = "";
    				var slideDetails = "";
    				if(slide.getElementsByTagName("title")[0].childNodes != null && slide.getElementsByTagName("title")[0].childNodes[0] != null) {
    					slideTitle = slide.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    				}
    				if(slide.getElementsByTagName("details")[0].childNodes != null && slide.getElementsByTagName("details")[0].childNodes[0] != null) {
    					slideDetails = slide.getElementsByTagName("details")[0].childNodes[0].nodeValue;
    				}
    				animSlide.title = slideTitle;
    				animSlide.details = slideDetails;
   
    				animSlide.actors = {switches: [], wires: [], balloons: []};
    				
    				var switches = slide.getElementsByTagName("switch");
    				if(switches != null) {
    					for (var i=0; i<switches.length; i++) {
    						var switchNode = switches[i];
    						var id = switchNode.getAttribute("id");
    						var state = switchNode.getAttribute("state");
    						animSlide.actors.switches.push({'id': id, 'state': state});
    					}
    				}
    				var wires = slide.getElementsByTagName("circuit");
    				if(wires != null) {
    					for (var i=0; i<wires.length; i++) {
    						var wireElem = wires[i];;
    						var id = wireElem.getAttribute("id");
    						var state = wireElem.getAttribute("state");
    						var direction = wireElem.getAttribute("direction");
    						animSlide.actors.wires.push({'id': id, 'state': state, 'direction': direction});
    					}
    				}
    				var balloons = slide.getElementsByTagName("dcballoon");
    				if(balloons != null) {
    					for (var i=0; i<balloons.length; i++) {
    						var balloonElem = balloons[i];
    						var id = balloonElem.getAttribute("id");
    						var state = balloonElem.getAttribute("state");
    						animSlide.actors.balloons.push({'id': id, 'state': state});
    					}
    				}
                    animationData.slides.push(animSlide);
    			}
                self.animationData = animationData;
            }
			try {
				xmlhttp.open("GET", this.svgFileURL + ".xml", false);
				xmlhttp.send(); 
			} catch (ex) {
				// nothing
			}
    	}
    	
    	WireDiagramMgr.prototype.loadJSON = function() {
    		var self = this;
			$.getJSON(this.svgFileURL + '.json', function(json) {
				self.getCircuitTypesData(json);
			});
    	}
    	
    	WireDiagramMgr.prototype.getCircuitTypesData = function(jsonData) {
    		this.circuitTypesData = jsonData;  		
    	}

/**
 * Wire Diagram.
 */
	
	
	WireDiagram = function (svg, title, customer, svgFileURL, animationData, circuitTypesData) {
						
		this.svgHandler = svg;
		this.title = title;
		this.customer = customer;
		this.svgFileURL = svgFileURL;
		
		this.wiringDiagram = new AnimatedWiringDiagram(svg, animationData, null, circuitTypesData, false, this);
		
		this.slides = [];
	
		this.isLegacy = false;
		
		this.areCircuitTypesShowing = false;
		
		this.showBalloons = true;
		this.showLabels = true;
		
		this.currentSelectedAnimation = 0;
		
		this.wiringHighlighter = null;
	};


    	/**
    	 * Initialize a slide album - new or existing:
    	 * - do automatic labeling for actors having no labels 
    	 * - create UI objects to enable actors for animation
    	 * - load existing animation data (if any)
    	 * - initialize slider
    	 * - check for errors and report errors and wires with no circuit type assigned
    	 */
    	WireDiagram.prototype.init = function() {
    		
    		var self = this;
    		
    		this.isLegacy = this.isSVGLegacy();

    		this.wiringDiagram.viewer = this;
    		this.wiringDiagram.init();
    	
    		// load existing animation data (into slides objects)
    		this.loadAnimationData();
			    		        	
        	this.drawAnimationsMenu();
        	this.drawCircuitTypeMenu();
        	
        	// hide ballons
        	this.hideVoltageBalloons();
        	
        	if(jQuery.isEmptyObject(this.wiringDiagram.balloons)) {
        		$("#showBalloons").attr("disabled", true);
        	} else {
        		$("#showBalloons").prop("checked", true);
        	}
        	
        	if(jQuery.isEmptyObject(this.wiringDiagram.wireSegmentLabels)) {
        		$("#showLabels").attr("disabled", true);
        	} else {
        		$("#showLabels").prop("checked", true);
        	}
        	
        	$("#showLabels").on("change", function() {
        		if($('#showLabels').is(":checked")) {
        			self.showLabels = true;
        			self.showWireLabels();
        		} else {
        			self.showLabels = false;
        			self.hideWireLabels();
        		}
        	});
        	
        	$("#showBalloons").on("change", function() {
        		if($('#showBalloons').is(":checked")) {
        			self.showBalloons = true;
        			self.showVoltageBalloons();
        		} else {
        			self.showBalloons = false;
        			self.hideVoltageBalloons();
        		}
        	});
        	
        	var wireSegments = {};
        	var isEmpty = true;
        	for(var key in this.wiringDiagram.wireSegments) {
        		var wireSegmentObj = this.wiringDiagram.wireSegments[key];
        		wireSegments[key] = wireSegmentObj.element;
        		isEmpty = false;
        	}
        	
        	$("a[href='#highlighter']").on('shown.bs.tab', function() {
        		if(!jQuery.isEmptyObject(self.wiringDiagram.wireSegments) && self.slides.length > 0) {
        			self.loadSlide(0);
            		// reset circuit type highlights
    				for (var key in self.wiringDiagram.wireSegments) {
    	        		wire = self.wiringDiagram.wireSegments[key];
    	        		if(wire.circuitType != null) {
    	        			wire.hideCircType(); // hide circuit types indications
    	        		} 
    				}
        		}
        		var svgURL = self.svgFileURL;
        		var arr = svgURL.split('/');
    			var customer = arr[arr.length-3];
    			var workspacePath = config['workspace_folder_path'];
    			var path = "../" + workspacePath + "/" + customer;
            	var diagramId = self.title + self.customer;
            	self.wiringHighlighter = new WiringHighlighter(self.svgHandler.svg, path, diagramId, null); //isEmpty ? null : wireSegments);
        	});
     
        	$("a[href='#animations']").on('shown.bs.tab', function() {
        		self.wiringHighlighter.removeHighlightElements();
        		self.wiringHighlighter = null;
        		//self.loadSlide(self.currentSelectedAnimation);
        	});
        	
        	if(jQuery.isEmptyObject(this.wiringDiagram.wireSegments)) {
        		$('[href=#highlighter]').tab('show');
        	}
    	}
     	
     	/**
     	 *  Load animation data if exists, otherwise prepare the inital slide.
     	 */
     	WireDiagram.prototype.loadAnimationData = function() {
     		var messages = [];
     		if(this.wiringDiagram.animationData != null && this.wiringDiagram.animationData.slides != null && this.wiringDiagram.animationData.slides.length > 0) {
    			$("#circuitTitle").val(this.wiringDiagram.animationData['albumtitle']);
     			for(var index=0; index<this.wiringDiagram.animationData.slides.length; index++) {
    				if(index == 0) {
    					$("#stepTitle").attr("disabled", true);
    	    			$("#stepDetails").attr("disabled", true);
    	    			$("#deleteSlide").attr("disabled", true);
    				}
     				var slide = this.wiringDiagram.animationData.slides[index];
    				var slideObj = new $.Slide(slide.id, slide.title, slide.details, this);
    				for(var i=0; i<slide.actors.wires.length; i++) {
    					var wireActorData = slide.actors.wires[i];
    					var wireActor = new $.WireSegment(wireActorData.id, this.wiringDiagram);
    					wireActor.state = wireActorData.state;
    					wireActor.flowDirection = wireActorData.direction;
    					if(this.wiringDiagram.actors[wireActor.id] != null) {
            				slideObj.actors[wireActor.id] = wireActor;
    					} else {
    						var slideNumber = index + 1;
    						var message = localize("Slide") + " " + slideNumber + ": " + localize("No wire segment with id {id} is found in the diagram", {id:wireActor.id}) + ".\n";
    						messages.push(message);
    					}
    				}
    				for(var j=0; j<slide.actors.switches.length; j++) {
    					var switchActorData = slide.actors.switches[j];
    					var switchActor = new $.Switch(switchActorData.id, this.wiringDiagram);
    					switchActor.position = switchActorData.state;
    					if(this.wiringDiagram.actors[switchActor.id] != null) {
            				slideObj.actors[switchActor.id] = switchActor;
    					} else {
    						messages.push(localize("Slide") + " " + (j + 1) + ": " + localize('No switch with id {id} is found in the diagram', {id: switchActor.id}) + ".\n");
    					}
    				}
    				for(var k=0; k<slide.actors.balloons.length; k++) {
    					var balloonActorData = slide.actors.balloons[k];
    					var balloonActor = new $.DCBalloon(balloonActorData.id, this.wiringDiagram); 
    					balloonActor.value = balloonActorData.state;
    					if(this.wiringDiagram.actors[balloonActor.id] != null) {
            				slideObj.actors[balloonActor.id] = balloonActor;
    					} else {
    						messages.push("<b>" + localize("Slide") + " " + (k + 1) + "</b>:" + localize("No voltage balloon with id {id} is found in the diagram", {id: "<b>" + balloonActor.id + "</b>"}) + ".\n");
    					}
    				}
    				this.slides.push(slideObj);
    			}
    		} else {
    			// prepare the inital slide
    		}
     		// display inconsistency errors
     		if(messages.length > 0) {
     			var errorsReport = [localize("WARNING! ANIMATION DATA INCONSISTENCY REPORT") +": \n"];
				errorsReport = errorsReport.concat(messages);
        	    displayUserNotification('warning', errorsReport);
     		}
     	}
     	
     	/**
     	 * Load and visualise current slide data (animations)
     	 * @param index The index of the slide to be loaded
     	 */
     	WireDiagram.prototype.loadSlide = function(index) {
    		var slide = this.slides[index];
    		for(var actorId in slide.actors) {
    			var actor = slide.actors[actorId];
    			actor.showAnimation(); // TODO: show balloons/labels
    		}
     	}
     	
     	WireDiagram.prototype.showVoltageBalloons = function() {
     		for(var ballonID in this.wiringDiagram.balloons) {
				this.wiringDiagram.balloons[ballonID].show();
			}
     	}
     	
     	WireDiagram.prototype.hideVoltageBalloons = function() {
     		for(var ballonID in this.wiringDiagram.balloons) {
				this.wiringDiagram.balloons[ballonID].hide();
			}
     	}
     	
     	WireDiagram.prototype.showWireLabels = function() {
     		for(var wireID in this.wiringDiagram.wireSegmentLabels) {
				this.wiringDiagram.wireSegmentLabels[wireID].show();
			}
     	}
     	
     	WireDiagram.prototype.hideWireLabels = function() {
     		for(var wireID in this.wiringDiagram.wireSegmentLabels) {
				this.wiringDiagram.wireSegmentLabels[wireID].hide();
			}
     	}
     	
     	WireDiagram.prototype.getBalloonByWireID = function(wireID, balloonsToWires) {
     		if(balloonsToWires  == null) {
     			balloonsToWires = this.balloonToWires;
     		}
    		for(var i=0; i<balloonsToWires.length; i++) {
    			var wireBalloonGroup = balloonsToWires[i];
    			if(wireBalloonGroup.wire.attr("id") == wireID) {
    				return balloonsToWires[i].balloon;
    			}
    		}
    		return null;
    	}
    	
    	WireDiagram.prototype.isSVGLegacy = function() {
    		return this.wiringDiagram.svg.selectAll("g[id^='"+CIRCUITS_LAYER+"']").length == 0;
    	}
    	
    	WireDiagram.prototype.drawCircuitTypeMenu = function() {
    		
    		var self = this;
			var html = "";
    		for(var circuitType in this.wiringDiagram.circuitTypes) { 
    			if(this.wiringDiagram.circuitTypes[circuitType].hasWires) {
	    			html += '<div style="margin-top:5px;" >' +
			  					'<a href="#" class="circuit-type" data-type="' + circuitType  + '">' + 
			  					'<div class="pull-left" style="border:1px solid black; border-radius: 4px;margin-right:5px;margin-top:2px;width:17px;height:17px;background-color:' + this.wiringDiagram.circuitTypes[circuitType].color + '"> </div>' + " " + this.wiringDiagram.circuitTypes[circuitType].name + '</a>' +
	  						'</div>';
    			}
    		}
    		html += '<div style="margin-top:6px;" >' +
						'<a href="#" class="toggle-all-circ-types"> <span class="glyphicon glyphicon-th"> </span><b>' + " " + localize('Toggle All Circuit Types') + '</b></a>' +
					'</div>';
			$("#wireDiagramsCircuitsPanel").html(html);
			
			$(".circuit-type").on("click", function() {
    			var type = $(this).data("type");
    			self.toggleCircuitType(type);
			});
			$(".toggle-all-circ-types").on("click", function() {
   				self.toggleAllCircuitTypes();
			});
    	}
    
    	WireDiagram.prototype.drawAnimationsMenu = function() {
    		
    		var self = this;
			var html = "";
    		for(var i=0; i<this.slides.length; i++) {
    			var title = i>0 ?  this.slides[i].title : localize("[STOP ANIMATION]");
    			var iconClass = i>0 ? "glyphicon glyphicon-play" : "glyphicon glyphicon-stop";
    			html += '<div style="margin-top:6px;" >' +
		  					'<a href="#" class="wire-animation" data-index="' + i  + '">' + 
		  					'<span class="' + iconClass + '"> </span>' + " " + title + '</a>' +
  						'</div>';
    		}
			$("#wireDiagramAnimationsPanel").html(html);
			
			$(".wire-animation").on("click", function() {
				self.startAnimation(this);				
			});
    	}
    	
    	WireDiagram.prototype.toggleCircuitType = function(type) {
    		if(this.currentSelectedAnimation > 0) {
    			return;
    		}
    		for(var wireID in this.wiringDiagram.wireSegments) {
    			var wire = this.wiringDiagram.wireSegments[wireID];
    			var circType = wire.circuitType;
    			if(circType != null && circType.type == type) {
    				if(wire.isCircuitTypeShowing()) {
    					wire.hideCircType();
    					if(wire.label != null) {
    		    			wire.label.hide();
    		    		}
    				} else {
    					wire.showCircType();
    					if(this.showLabels && wire.label != null) {
    						wire.label.show();
    		    		}
    				}
    			}
    		}
    	}
    	
    	WireDiagram.prototype.toggleAllCircuitTypes = function() {
    		if(this.currentSelectedAnimation > 0) {
    			return;
    		}
    		for(var wireID in this.wiringDiagram.wireSegments) {
    			var wire = this.wiringDiagram.wireSegments[wireID];
    			var circType = wire.circuitType;
    			if(circType != null) {
    				if(this.areCircuitTypesShowing) {
    					wire.hideCircType();
    					if(wire.label != null) {
    						wire.label.hide();
    		    		}
    				} else {
    					wire.showCircType();
    					if(this.showLabels && wire.label != null) {
    						wire.label.show();
    		    		}
    				}
    			}
    		}
    		if(this.areCircuitTypesShowing) {
    			this.areCircuitTypesShowing = false;
			} else {
				this.areCircuitTypesShowing = true;
			}
    	}
    	
    	WireDiagram.prototype.startAnimation = function(target) {
    		
			var slideIndex = $(target).data("index");
			this.currentSelectedAnimation = slideIndex;

    		// reset circuit type highlights
			for (var key in this.wiringDiagram.wireSegments) {
        		wire = this.wiringDiagram.wireSegments[key];
        		if(wire.circuitType != null) {
        			wire.hideCircType(); // hide circuit types indications
        		} 
			}
			
			// show/hide voltage balloons
			if(slideIndex > 0) {
				if(this.showBalloons) {
    				this.showVoltageBalloons();
    			}
			} else {
				this.hideVoltageBalloons();    				
			}
			
			this.loadSlide(slideIndex);
			// show slide details (if any)
			if(slideIndex != 0 && this.slides[slideIndex].details != null && this.slides[slideIndex].details != "") {
				$("#slideDetailsPanel").html(this.slides[slideIndex].details);
				$("#slideDetailsPanel").css("display", "block");
			} else {
				$("#slideDetailsPanel").html("");
				$("#slideDetailsPanel").css("display", "none");
			}
    	}

