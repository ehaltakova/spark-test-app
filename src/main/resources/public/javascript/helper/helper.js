/**
* Common helper functions.
*/
      
/**
 * Set browser cookie.
 * @param name string Cookie name
 * @param value string Cookie stingified value
 * @param exdays int Cookie expiration period in days
 */
function setCookie(name, value, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expireDate = d.toUTCString();
	var expires = 'expires=' + expireDate;
	if(value != '') {
		var content = JSON.parse(value);
		content['expireDate'] = expireDate;
		value = JSON.stringify(content); // add the expiration date to the cookie value itself
	}
	document.cookie = name + '=' + escape(value) + '; ' + expires;
}

/**
 * Update browser cookie value without changing the expiration date.
 * @param name string Cookie name
 * @param value string Cookie stingified value
 */
function updateCookie(name, value) {
	if(value != '') {
		var content = JSON.parse(value);
		var expireDate = content['expireDate'];
		var expires = 'expires=' + expireDate;
		document.cookie = name + '=' + escape(value) + '; ' + expires; // update content without changing the expire date
	}
}

/**
 * Get cookie value by its name.
 * @param cookieName string Cookie name
 * @returns string Cookie value as string
 */
function getCookie(cookieName) {
	var name = cookieName + '=';
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return unescape(c.substring(name.length, c.length));
	}
	return '';
}

/**
 * Delete a cookie.
 * @param name string Cookie name
 */
function clearCookie(name) {
	setCookie(name, '', 1);
}

/**
 * Sanitize user input.
 * @param input string User input as string.
 * @returns string Sanitzied input
 */
function sanitize(input) {
	var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
				replace(/<[\/\!]*?[^<>]*?>/gi, '').
				 replace(/<style[^>]*?>.*?<\/style>/gi, '').
				 replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
	return output;
}

/**
 * Get a URL parameter by name exploring current window URL.
 * @param paramName string The name of the parameter being searched
 * @returns string The value of the parameter being searched
 */
function getURLParameter(paramName) {
	var pageURL = window.location.search.substring(1);
    var urlParams = unescape(pageURL).split('&');
    for (var i = 0; i < urlParams.length; i++) {
        var param = urlParams[i].split('=');
        if (param[0] == paramName) {
            return param[1];
        }
    }
    return null;
}

function getDecodedURLParam(queryString, paramName) {
    var urlParams = queryString.split('&');
    for (var i = 0; i < urlParams.length; i++) {
        var param = urlParams[i].split('=');
        if (param[0] == paramName) {
            return param[1];
        }
    }
    return null;
}

function localize(key, data) {
//	var translation = window['i18n'][key];
//    if (translation) {
//        if (!translation.call) {
//            // Translation is not a function, assume a static string:
//            return translation;
//        }
//        return translation(data);
//    }
//    // No mapping found, the translation value is the translation key:
//    return key;
	return key;
}

function localizeStaticContent() {
	
	[].forEach.call(document.querySelectorAll('[data-localize]'), function (node) {
	    var dataset = node.dataset,
	        data = {},
	        attr = dataset.localize,
	        translation = window['i18n'][attr || node.innerHTML],
	        key;
	    if (translation) {
	        if (attr) {
	            node.textContent = (translation.call && translation(dataset)) || translation;
	        } else {
	            if (translation.call) {
	                for (key in dataset) {
	                    if (dataset.hasOwnProperty(key) && key !== 'localize') {
	                        data[key] = escapeHTML(dataset[key]);
	                    }
	                }
	                node.innerHTML = translation(data);
	            } else {
	                node.innerHTML = translation;
	            }
	        }
	    } else if (attr) {
	        node.textContent = attr;
	    }
	});
}
