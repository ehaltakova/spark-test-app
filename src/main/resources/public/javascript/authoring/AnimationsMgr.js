/**
 * Slide Album Animations Manager.
 * Implements animation slides CRUD.
 * Handle slide loading and animation display.
 * Corresponds to the Animation tab.
 */

	AnimationsMgr = function (slideAlbum) {
		this.slideAlbum = slideAlbum;
		this.slides = [];
		this.currentSlideIndex = 1;
	};

    	
    	/**
    	 * Set up Animations tab:
    	 * - propagate existing animation data through the slides/prepare initial slide;
    	 * - draw and initilize Slider Panel control.
    	 */
    	AnimationsMgr.prototype.initialize = function() {
    		    		
    		this.loadAnimationData();
    		this.drawAnimationsSlider();
			
			$("#saveSlides").on("click", (function() {
				this.saveSlides();
			}).bind(this));
			$("#addSlide").on("click", (function() {
				this.addSlide();
			}).bind(this));
			$("#insertSlide").on("click", (function() {
				this.insertSlide();
			}).bind(this));
			$("#deleteSlide").on("click", (function() {
				this.deleteSlide();
			}).bind(this));
			$("#propagateChanges").on("click", (function() {
				this.propagateChanges();
			}).bind(this));
		};
    	
    	/**
     	 *  Propagate existing animation data through the slides / prepare initial slide (if no animation data).
     	 */
     	AnimationsMgr.prototype.loadAnimationData = function() {
     		var messages = [];
     		var animationData = this.slideAlbum.wiringDiagram.animationData; // TODO: keep the slide album data in the SlideAlbum?
     		if(animationData != null && animationData['slides'] != null && animationData['slides'].length > 0) {
				var slides = animationData['slides'];
    			$("#circuitTitle").val(animationData['albumtitle']);
     			for(var index=0; index<slides.length; index++) {
    				
     				// TODO: is this the right place to do this?
     				if(index == 0) {
    					$("#stepTitle").attr("disabled", true);
    	    			$("#stepDetails").attr("disabled", true);
    	    			$("#deleteSlide").attr("disabled", true);
    				}
     				
     				var slide = slides[index];
    				var slideObj = new $.Slide(slide['id'], slide['title'], slide['details'], this);
					var slideActors = slide['actors'];
    				for(var i=0; i<slideActors['wires'].length; i++) {
    					var wireActorData = slideActors['wires'][i];
    					var wireActor = new $.WireSegment(wireActorData['id'], this.slideAlbum.wiringDiagram); // TODO: this is ugly!
    					wireActor.state = wireActorData['state'];
    					wireActor.flowDirection = wireActorData['direction'];
    					if(this.slideAlbum.wiringDiagram.actors[wireActor.id] != null) {
            				slideObj.actors[wireActor.id] = wireActor;
    					} else {
    						messages.push(localize("Slide {ind}: No wire segment with id {wireID} is found in the diagram.\n", {ind: (index + 1), wireID: wireActor.id}));
    					}
    				}
    				for(var j=0; j<slideActors['switches'].length; j++) {
    					var switchActorData = slideActors['switches'][j];
    					var switchActor = new $.Switch(switchActorData['id'], this.slideAlbum.wiringDiagram);
    					switchActor.position = switchActorData['state'];
    					if(this.slideAlbum.wiringDiagram.actors[switchActor.id] != null) {
            				slideObj.actors[switchActor.id] = switchActor;
    					} else {
    						messages.push(localize("Slide {ind}: No switch with id {switchID} is found in the diagram.\n", {ind: (j + 1), switchID: switchActor.id}));
    					}
    				}
    				for(var k=0; k<slideActors['balloons'].length; k++) {
    					var balloonActorData = slideActors['balloons'][k];
    					var balloonActor = new $.DCBalloon(balloonActorData['id'], this.slideAlbum.wiringDiagram); 
    					balloonActor.value = balloonActorData['state'];
    					if(this.slideAlbum.wiringDiagram.actors[balloonActor.id] != null) {
            				slideObj.actors[balloonActor.id] = balloonActor;
    					} else {
    						messages.push(localize("<b>Slide {ind}</b>: No voltage balloon with id <b>{balloonID}</b> is found in the diagram.\n", {ind: (k+1), balloonID: balloonActor.id}));
    					}
    				}
    				this.slides.push(slideObj);
    			}
    		} else {
    			// prepare the inital slide
    			this.currentSlideIndex = 1;
    			var initialSlideID = this.generateSlideIdNumber();
    			var slideObj = new $.Slide(initialSlideID, localize("[ Initial Slide ]"), "", this);
    			var slideAlbumActors = {};
    			for(var actorID in this.slideAlbum.wiringDiagram.actors) {
    				var actor = this.slideAlbum.wiringDiagram.actors[actorID];
    				if(actor instanceof $.WireSegment) {
    					slideAlbumActors[actor.id] = actor;
    					var wireUIObject = this.slideAlbum.wiringDiagram.wireSegments[actor.id];
    					wireUIObject.makeCold(false);
    				} else if(actor instanceof $.DCBalloon) {
    					slideAlbumActors[actor.id] = actor;
    					var balloonUIObject = this.slideAlbum.wiringDiagram.balloons[actor.id];
    					balloonUIObject.setValue(actor.value, false);
    				} else if(actor instanceof $.Switch) {
    					actor.position = "1"; //TODO: why?
    					slideAlbumActors[actor.id] = actor;
    					var switchUIObject = this.slideAlbum.wiringDiagram.switches[actor.id];
    					switchUIObject.setSelectedPositionValue("1", false);
    				}
    			}
    			slideObj.actors = slideAlbumActors;
    			this.slides.push(slideObj);
    			$("#stepTitle").attr("disabled", true);
    			$("#stepDetails").attr("disabled", true);
    			$("#deleteSlide").attr("disabled", true);
    			this.currentSlideIndex = 1;
    			this.loadSlide(this.currentSlideIndex-1);
    		}
     		// display inconsistency errors
     		if(messages.length > 0) {
     			var errorsReport = [localize("WARNING! ANIMATION DATA INCONSISTENCY REPORT: \n")];
				errorsReport = errorsReport.concat(messages);
        	    displayUserNotification('warning', errorsReport);
     		}
		};
     	
     	/**
     	 * Load and visualise current slide data (animations).
     	 * @param index The index of the slide to be loaded
     	 */
     	AnimationsMgr.prototype.loadSlide = function(index) {
    		var slide = this.slides[index];
    		for(var actorId in slide.actors) {
    			var actor = slide.actors[actorId];
    			actor.showAnimation();
    		}
		};
     	
     	/**
     	 * Draw and set up Slider Panel control.
     	 */
     	AnimationsMgr.prototype.drawAnimationsSlider = function() {
    		    		
    		// initialize slider and and propagate animation data to the slider    		
			$('.slider').slider({min: 1, max: this.slides.length}); 

			// slider pipis
			if(this.slides.length > 1) {
				$('.slider').slider('pips', {  
				    first: 'label',  
				    last: 'label',  
				    rest: 'label',  
				});
			} else {
				$('.slider').slider('pips', {  
				    first: 'label',  
				    last: 'false',  
				    rest: 'label',  
				});
			}
			
			// slide change handler
			$('.slider').on("slidechange slide", (function( event, ui ) {
				
				// save previous slide values
				var previouslySelectedSlide = this.slides[this.currentSlideIndex-1];
				if(previouslySelectedSlide != null) {
					previouslySelectedSlide.title = $("#stepTitle").val();
					previouslySelectedSlide.details = $("#stepDetails").val();
				} 
				
				// load current selected slide
				this.currentSlideIndex = ui.value;
				this.loadSlide(this.currentSlideIndex-1);
				
				// handle propagate changes function
				var currentSelectedSlide = this.slides[ui.value-1];
				if(currentSelectedSlide.isDirty && this.currentSlideIndex > 1) {
					$("#propagateChanges").show();
				} else {
					$("#propagateChanges").hide();
				}
				
				// update Slider UI
				$("#stepTitle").val(currentSelectedSlide.title);
				$("#stepDetails").val(currentSelectedSlide.details);
				if(this.currentSlideIndex == 1) {
					$("#stepTitle").attr("disabled", true);
	    			$("#stepDetails").attr("disabled", true);
	    			$("#deleteSlide").attr("disabled", true);
				} else {
					if(!this.slideAlbum.readonly) {
						$("#stepTitle").attr("disabled", false);
		    			$("#stepDetails").attr("disabled", false);
		    			$("#deleteSlide").attr("disabled", false);
					}
				}
			}).bind(this));
		};
    	
    	/** 
    	 * Add new slide to the slider.
    	 * New slide is a copy of the previously selected slide.
    	 */
    	AnimationsMgr.prototype.addSlide = function() {

    		// create new slide object and copy actors from currently selected slide to it
    		var slideToCopy = this.slides[this.currentSlideIndex == 0 ? this.currentSlideIndex : this.currentSlideIndex-1];
    		var slideID = this.generateSlideIdNumber();
    		slideToCopy.title = $("#stepTitle").val(); 
    		slideToCopy.details = $("#stepDetails").val(); 
    		var stepTitle = slideToCopy.title;
    		var stepDetails = slideToCopy.details;
			var newSlide = new $.Slide(slideID, stepTitle, stepDetails, this.slideAlbum);
			newSlide.actors = this.copyActors(slideToCopy.actors);
			
			// add new slide object to the slide album slides collection and update currently selected index
			this.slides.push(newSlide);
			this.currentSlideIndex = this.slides.length;

			// update the slider
			$('.slider').slider({min: 1, max: this.slides.length}); 
			$('.slider').slider('pips', {  
			    first: 'label',  
			    last: 'label',  
			    rest: 'label',  
			});
			$(".slider").slider("value", this.currentSlideIndex);
			
			this.slideAlbum.isDirty = true;
		};
    	
    	/** 
    	 * Insert new slide to the slider to the left of the currently selected slide.
    	 * New slide is a copy of the previously selected slide.
    	 */
    	AnimationsMgr.prototype.insertSlide = function() {

    		// create new slide object and copy actors from currently selected slide to it
    		var slideToCopy = this.slides[this.currentSlideIndex == 0 ? this.currentSlideIndex : this.currentSlideIndex-1];
    		slideToCopy.title = $("#stepTitle").val(); 
    		slideToCopy.details = $("#stepDetails").val();
    		var slideID = this.generateSlideIdNumber();
    		var stepTitle = slideToCopy.title;
    		var stepDetails = slideToCopy.details;
			var newSlide = new $.Slide(slideID, stepTitle, stepDetails, this.slideAlbum);
			newSlide.actors = this.copyActors(slideToCopy.actors);

			// insert the new slide to the left ot the selected slide
			this.slides.splice(this.currentSlideIndex, 0, newSlide);

			// update the slider
			$('.slider').slider({min: 1, max: this.slides.length}); 
			$('.slider').slider('pips', {  
			    first: 'label',  
			    last: 'label',  
			    rest: 'label',  
			});
			$(".slider").slider("value", this.currentSlideIndex);
			
			this.slideAlbum.isDirty = true;
		};
    	
    	/**
    	 * Delete currently selected slide.
    	 */
    	AnimationsMgr.prototype.deleteSlide = function() {
    		
    		// remove the selected slide from the slide album
    		this.slides.splice(this.currentSlideIndex-1, 1);
			//this.currentSlideIndex = this.currentSlideIndex-1;

			// update the slider
			$('.slider').slider({min: 1, max: this.slides.length}); 
			$('.slider').slider('pips', {  
			    first: 'label',  
			    last: 'label',  
			    rest: 'label',  
			});
			$(".slider").slider("value", this.currentSlideIndex);
			
			this.slideAlbum.isDirty = true;
		};
    	
    	/**
    	 * Convert slides animation data in a format for save and save it.
    	 */
    	AnimationsMgr.prototype.saveSlides = function() {
    		var albumTitle = $("#circuitTitle").val();
    		
    		// save last edited slide title and details
    		var lastEditedSlide = this.slides[this.currentSlideIndex-1];
    		lastEditedSlide.title = $("#stepTitle").val(); 
    		lastEditedSlide.details = $("#stepDetails").val(); 
    		
    		var animSlides = [];
    		for(var i=0; i<this.slides.length; i++) {
    			var slide = this.slides[i];
    			var animSlide = {
					'id' : slide.id, 
					'title' : slide.title, 
					'details' : slide.details, 
					'actors' : {'wires': [], 'switches': [], 'balloons': []}
				};
    			for(var actorID in slide.actors) {
    				var actor = slide.actors[actorID];
    				if(actor instanceof $.WireSegment) {
    					animSlide['actors']['wires'].push({'id': actor.id, 'state': actor.state, 'direction': actor.flowDirection});
    				} else if(actor instanceof $.Switch) {
    					animSlide['actors']['switches'].push({'id': actor.id, 'state': actor.position});
    				} else if(actor instanceof $.DCBalloon) {
    					animSlide['actors']['balloons'].push({'id': actor.id, 'state': actor.value});
    				} 
    			}
    			animSlides.push(animSlide);
    		}
    		this.saveAnimationData(albumTitle, animSlides);
    		
    		// reset propagate changes after save
    		this.slides.forEach(function(slide) {
    			slide.changes = {};
    			slide.isDirty = false;
    		});
			$("#propagateChanges").hide();
		};
    	
    	/**
    	 * Call REST API service for animation data save.
    	 * @param albumTitle string Album title
    	 * @param slides animation data to be saved
    	 */
    	AnimationsMgr.prototype.saveAnimationData = function(albumTitle, slides) {
    		var restApiUtil = new RESTAPIUtil();
    		var animationData = {'albumTitle': albumTitle, 'slides': slides};
    	    var url = API_BASE_URL + '/api/saveAnimationData';
    	    var type = 'POST';	 
    	    var data = {'title': this.slideAlbum.wiringDiagram.slideAlbumData['title'], 'customer': this.slideAlbum.wiringDiagram.slideAlbumData['customer'], 'animationData': animationData};
    	    var callback = (function(resp) { 
    	    	displayUserNotification('success', [localize('Animation data successfully saved.')]);
    			this.slideAlbum.isDirty = false;
    	    }).bind(this);
    	    restApiUtil.execute(url, type, data, callback, true);	    	    
		};
    	
    	/** 
    	 * Propagate changes (wires, switches, balloons) from current selected slide to all slide to the right.
    	 */
    	AnimationsMgr.prototype.propagateChanges = function() {
    		var currentSelectedSlide = this.slides[this.currentSlideIndex-1];
    		if(currentSelectedSlide.isDirty) {
    			for(var i=this.currentSlideIndex+1; i<=this.slides.length; i++) {
    				var currentSlide = this.slides[i-1];
    				for(actorId in currentSelectedSlide.changes) {
    					currentSlide.actors[actorId] = currentSelectedSlide.changes[actorId];
    				}
    			}
    			currentSelectedSlide.changes = {};
    			currentSelectedSlide.isDirty = false;
    			$("#propagateChanges").hide();
    		}
		};
     	
     	/**
    	 * Generate slide id.
    	 * @returns int Slide id
    	 */
    	AnimationsMgr.prototype.generateSlideIdNumber = function() {
    		var date = new Date();
    		var numericDate = date.getTime();
    		var str = "jylbc" + numericDate + "0123456789876543210";
    		var idNumber = str.substring(0, 20);
    		return idNumber;
		};
    	
    	/**
    	 * Copy specified actors (deep copy).
    	 * @param actors Actors to be copied
    	 * @returns map Specified actors copies
    	 */
    	AnimationsMgr.prototype.copyActors = function(actors) {
    		var newActors = {};
    		for(var actorId in actors) {
    			var actor = actors[actorId];
    			if(actor instanceof $.WireSegment) {
    				var wireActor = new $.WireSegment(actor.id, this.slideAlbum.wiringDiagram);
    				wireActor.state = actor.state;
    				wireActor.direction = actor.direction;
					newActors[actor.id] = wireActor;
				} else if(actor instanceof $.DCBalloon) {
					var balloonActor = new $.DCBalloon(actor.id, this.slideAlbum.wiringDiagram);
					balloonActor.value = actor.value;
					newActors[actor.id] = balloonActor;
				} else if(actor instanceof $.Switch) {
					var switchActor = new $.Switch(actor.id, this.slideAlbum.wiringDiagram); // TODO: ugly too
					switchActor.position = actor.position;
					newActors[actor.id] = switchActor;
				}
			}
    		return newActors;
		};
