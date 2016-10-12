/**
 * Slide Album Files Manager.
 * Implements functions for import, delete and download files from/to the slide album.
 * Corresponds to the Files tab.
 */

	FilesMgr = function (slideAlbum) {
		
		this.slideAlbum = slideAlbum;
		this.svgFile = this.slideAlbum.wiringDiagram.slideAlbumData['svg'];
		this.restApiUtil = new RESTAPIUtil();
		
		this.filesToImport = [];
	};
    	
    	/**
    	 * Initialize and set up Files tab.
    	 */
    	FilesMgr.prototype.initialize = function() {
    		
			$("a[href='#slideAlbumGeneral']").on('shown.bs.tab', (function() {
				
				// get slide album data from the server
				var url = API_BASE_URL + '/api/getSlideAlbum';
	    		var type = 'POST';	 
	    		var data = {'title': this.slideAlbum.wiringDiagram.slideAlbumData['title'], "customer":  this.slideAlbum.wiringDiagram.slideAlbumData['customer']}; // request data
	    		var callback = (function(response){ 
	    			this.slideAlbum.wiringDiagram.slideAlbumData = response['slideAlbum']; // update slide album with the last data from the server!
	    			// draw and populate the tab
	    			this.drawImportAndDeleteSection(); 
					if(this.slideAlbum.readonly) {
						$("#xmlFileupload").attr("disabled", true);
						$("#jsonFileupload").attr("disabled", true);
						$(".delete-file").attr("disabled", true);
						$(".delete-file").css("pointer-events", "none");
					}
					$("#importFilesBtn").off().on('click', (function() {
						var msg = localize("<b>NOTE</b>: This action will reload the slide album. If you have any unsaved changes, please save them first.");
						bootbox.confirm({
		      	       		'message': msg,
		      	       		'buttons': {
		      	       			'confirm': {
		      	       				'label': localize('OK')
		      	       			},
		      	       			'cancel': {
		      	       				'label': localize('Cancel')
		      	       			}
		      	       		},
		      	       		'callback': (function(result) {
		          	       		if(result) {
		          	       			this.importFiles(this.filesToImport);
		          	       		}
		      	       		}).bind(this)
		      	       	}).bind(this); 
					}).bind(this));
					this.drawDownloadSection();
	    		}).bind(this); 
	    		this.restApiUtil.execute(url, type, data, callback, true);
			}).bind(this));
    	};
    	
		/**
		 * Delete a file from the slide album.
		 * @param filename string Name of the file to be deleted
		 * @param ext string Specified file extension.
		 */
		FilesMgr.prototype.deleteFile = function(filename, ext) {
    		var title = this.slideAlbum.wiringDiagram.slideAlbumData['title'];
    		var customer = this.slideAlbum.wiringDiagram.slideAlbumData['customer'];
    		var callback = function(response) {
    			location.reload(); // reload the whole page!
    		};
    		var url = API_BASE_URL + '/api/deleteSlideAlbumFile';
    		var type = 'POST';	 
    		var data = {'title': title, "customer": customer, "filename": filename}; // request data
    		this.restApiUtil.execute(url, type, data, callback, true);
    	};
    	
    	/**
		 * Import files to the slide album.
		 * @param filenames array List with the filenames to be imported
		 */
    	FilesMgr.prototype.importFiles = function(filenames) {
    		var title = this.slideAlbum.wiringDiagram.slideAlbumData['title'];
    		var customer = this.slideAlbum.wiringDiagram.slideAlbumData['customer'];
    		var callback = function(response) {
    			location.reload();
    		};
    		var url = API_BASE_URL + '/api/importFileToSlideAlbum';
    		var type = 'POST';	 
    		var data = {'title': title, "customer": customer, "filenames": filenames}; // request data
    		this.restApiUtil.execute(url, type, data, callback, true);
    	};
    	
    	/**
    	 * Draw and set up Import & Delete Section.
    	 */
    	FilesMgr.prototype.drawImportAndDeleteSection = function() { 
    		var hasAnimationFiles = false; //this.slideAlbum.animationData != null && this.slideAlbum.animationData.slides != null && this.slideAlbum.animationData.slides.length > 0;
			var hasCircuitTypeDefs = false; //this.slideAlbum.circuitTypesData != null;
			var files = this.slideAlbum.wiringDiagram.slideAlbumData.files;
    		for(var i=0; i<files.length; i++) {
    			var file = files[i];
        		if(file['ext'] == "xml") {
        			hasAnimationFiles = true;
        		} else if(file['ext'] == "json") {
        			hasCircuitTypeDefs = true;
        		}
    		}
			var html = "";
			if(hasAnimationFiles) {
				html += this.createFileLink('xml');
			} else {
				html += this.createUploadControl('xml');
			}
			if(hasCircuitTypeDefs) {
				html += this.createFileLink('json');
			} else {
				html += this.createUploadControl('json');
			}
			$("#slideAlbumFiles").html(html);			
			
			if(hasAnimationFiles) {
				this.handleLinkFile('xml');
			} else {
				this.handleUploadControl('xml');
			}
			if(hasCircuitTypeDefs) {
				this.handleLinkFile('json');
			} else {
				this.handleUploadControl("json");
			}
			
			$(".delete-file").attr("title", localize("Delete File"));
			$(".delete-file").on('click', (function(e) {
				var message = localize("Are you sure you want to delete this file from the slide album?") + "<br><br>";
				message += localize("<b>NOTE</b>: This action will reload the slide album. If you have any unsaved changes, please save them first.");
   				var targetElement = e.target.nodeName.toLowerCase() != "a" ? e.target.parentNode : e.target; //NOTE target might be the the link element <a> or the inner <span> element hodling the button icon (depending on the exact mouse position)
				var ext = $(targetElement).data("type"); // NOTE: target element is the child span element and not the link!
				var fileName = this.svgFile + "." + ext;
				bootbox.confirm({
      	       		'message': message,
      	       		'buttons': {
      	       			'confirm': {
      	       				'label': localize('OK')
      	       			},
      	       			'cancel': {
      	       				'label': localize('Cancel')
      	       			}
      	       		},
      	       		'callback': (function(result) {
          	       		if(result) {
      	        			this.deleteFile(fileName, ext);
          	       		}
      	       		}).bind(this)
      	       	}).bind(this); 
			}).bind(this));
    	};
    	
    	/**
    	 * Draw and set up Download section
    	 */
    	FilesMgr.prototype.drawDownloadSection = function() {
    		var html = "";
    		var files = this.slideAlbum.wiringDiagram.slideAlbumData.files;
    		for(var i=0; i<files.length; i++) {
    			var file = files[i];
    			var href = config['api_base_url'] + "/download.php?customer=" + this.slideAlbum.wiringDiagram.slideAlbumData['customer'] + "&title=" + this.slideAlbum.wiringDiagram.slideAlbumData['title'] + "&file=" + file['name'] + "."+ file['ext'];
    			html += '<div style="margin-top:6px;" >' +
			  				'<a href="' + href  + '" class="download-file" data-url="' +  file['name'] + '.' + file['ext']  + '">' + 
			  					'<span class="glyphicon glyphicon-download-alt"> </span>' + " " + file['name'] + '.' + file['ext'] + '</a>' +
			  			'</div>';
    		}
    		if(files.length > 1) {
    			var href = config['api_base_url'] + "/download.php?customer=" + this.slideAlbum.wiringDiagram.slideAlbumData['customer'] + "&title=" + this.slideAlbum.wiringDiagram.slideAlbumData['title'] + "&files=all";
    			html += '<div class="pull-left" style="margin-top:15px;" >' +
  					'<a id="getAll" title="Download all files in an archive" href="' + href  + '" class="btn btn-info btn-sm">'  + 
					'<span class="glyphicon glyphicon-download-alt"> </span> <b>' + localize("Download All") +'</b> </a>' +
					'</div>';
    		}
    		$("#downloadAlbumFiles").html(html);
    		$("#getAll").attr("title", localize("Download all files in an archive"));
    	};
    	
    	/**
    	 * Helper method to draw link to a slide album file.
    	 */
    	FilesMgr.prototype.createFileLink = function(ext) {
    		var linkId = "upload" + ext + "Link";
    		var uploadControlId = ext + "Fileupload";
    		return '<div class="row" style="margin-left:5px; margin-right:5px;">' + 
					  '<div class="pull-left" style="margin-right:10px;margin-bottom:10px;"><img src="images/' + ext + '.png" /></div>' + 
					  '<div class="pull-left" style="margin-top:6px;" >' +
					  	'<span id="' + linkId + '"></span>' +
					  '</div>' +
					  '<div class="pull-right" style="margin-top:6px;">' +
					  	'<a href="#" title="Delete file" class="delete-file" data-type="' + ext + '"> <span class="glyphicon glyphicon-remove"></span> </a>' +
					  '</div>' + 
					'</div>';
    	};
    	
    	/**
    	 * Helper method to draw slide album file upload control.
    	 */
    	FilesMgr.prototype.createUploadControl = function(ext) {
    		var uploadControlId = ext + "Fileupload";
    		return '<div class="row" data-ext="' + ext + '" style="margin-left:5px; margin-right:5px;">' + 
					  '<div class="pull-left" style="margin-right: 10px;margin-bottom:10px;"><img src="images/' + ext + '.png" /></div>' + 
					  '<div class="pull-left">' +
						 '<input style="margin-top:5px;" id="' + uploadControlId + '" type="file" name="files[]">' +
					  '</div>' +
					'</div>';
    	}; 
		
    	/** 
    	 * Helper method to set up link to a slide album file.
    	 * @param ext string File extension
    	 */
    	FilesMgr.prototype.handleLinkFile = function(ext) {
    		var linkId = "upload" + ext + "Link";
    		var uploadControlId = ext + "Fileupload";
    		$("#"+linkId).html(this.svgFile + "." + ext);
    	};    	
    	/** 
    	 * Helper method to set up and attach events to the file upload control.
    	 * @param ext string File extension
    	 * @param uploadContolId The id of the html element representing the upload control.
    	 */
    	FilesMgr.prototype.handleUploadControl = function(ext, uploadContolId) {
    		var uploadControlId = ext + "Fileupload";
    		    $('#'+uploadControlId).fileupload({
    		    	'url': config['api_base_url'] + '/src/upload/',
    		    	'acceptFileTypes': '/(\.|\/)(' + ext + ')$/i',
    		    	'replaceFileInput':false,
    		        'dataType': 'json',
    		        'change': (function (e, data) {
    		        	var parentDiv = $(e.target).parent().parent();
    		        	var ext = parentDiv.data("ext");
    		        	if(!data.files[data.files.length -1]) {
    		        		// remove the old selection from the array and hide the Import button if there are no files in the array
							/*var index = this.filesToImport.indexOf(item);
							if(index != -1) {
								this.filesToImport.splice(index, 1);
								if(this.filesToImport.length == 0) {
									$("#importFilesBtn").css("display", "hidden");
								}
							}*/
    		        	}
    		        }).bind(this),
    		        'add': (function (e, data) {	
    		        	if($('#importErrors')) {
    	   					$('#importErrors').html(""); 
    	   				}
    		        	var parentDiv = $(e.target).parent().parent();
    		        	var ext = parentDiv.data("ext");
    		        	var fileToUpload = data.files[data.files.length -1].name;
    		        	if(fileToUpload == this.svgFile+"."+ext) {
    		        		$("#importFilesBtn").css("display", "inline");
    		        		this.filesToImport.push(fileToUpload);
						data.submit(); 
    		        	} else {
    		        		var errorMsg = localize("ERROR: Incorrect file name.") + "\n";
    		        		errorMsg = errorMsg + localize("File should be named as the svg file with the '{ext}' extension:", {ext:ext}) + "'" + this.svgFile + "." + ext + "'";
    	   	    			displayNotification('danger', [errorMsg], '#importErrors', false);
    		        	}    		        	
    		        }).bind(this),
    		        'done': function (e, data) {
    		        },
    		        'error': function (e, data) {
    		        	displayUserNotification('danger', [localize('Error: file cannot be uploaded. Please, contact your system administrator.')]);
    		        }
    		    }).bind(this);
    	};