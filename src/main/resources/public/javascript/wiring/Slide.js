/**
 * Slide.
 * A slide is a single piece of wiring animation data for a particular slide album (represented as a single animation link in the animation menu).
 * It corresponds to a certaing state/part of the wiring diagram at a defined moment.
 * It holds the animation data description for the given slide.
 * 
 * A slide is characterized by the follwoing:
 * - id: unique identifier of the slide in the context of the slide album (index);
 * - title: short description of the slide;
 * - details: long description of the slide;
 * - actors: collection of actors objects (WireSegments, Switches, DCBalloons), describing the animation data.
 */
(function ($) { 
	
	/**
	 * Slide object constructor.
	 * @param id string Slide unique identifier
	 * @param title string Slide short description
	 * @param details string Slide long description
	 * @param slideAlbum SlideAlbum The slide album which the slide belongs to
	 * @return Slide object
	 */
	$.Slide = function (id, title, details, slideAlbum) {
		this.id = id
		this.title = title;
		this.details = details;
		this.slideAlbum = slideAlbum;
		this.actors = {};
		this.changes = {};
		this.isDirty = false;
	};

	/**
	 * Slide object methods
	 */
    $.Slide.prototype = {
    	
    };

}(jQuery));

