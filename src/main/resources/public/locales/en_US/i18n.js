(function () {
var i18n = window.i18n = window.i18n || {};
var MessageFormat = {locale: {}};

MessageFormat.locale.en=function(n){return n===1?"one":"other"}

var
c=function(d){if(!d)throw new Error("MessageFormat: No data passed to function.")},
n=function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: `"+k+"` isnt a number.");return d[k]-(o||0)},
v=function(d,k){c(d);return d[k]},
p=function(d,k,o,l,p){c(d);return d[k] in p?p[d[k]]:(k=MessageFormat.locale[l](d[k]-o),k in p?p[k]:p.other)},
s=function(d,k,p){c(d);return d[k] in p?p[d[k]]:p.other};

i18n["\x3cb\x3eSlide {ind}\x3c/b\x3e: No voltage balloon with id \x3cb\x3e{balloonID}\x3c/b\x3e is found in the diagram.\x0a"] = function(d){return "<b>Slide "+v(d,"ind")+"</b>: No voltage balloon with id <b>"+v(d,"balloonID")+"</b> is found in the diagram."};

i18n["\x3cspan class=\x22glyphicon glyphicon-fullscreen\x22\x3e\x3c/span\x3e  \x3cb\x3eZOOM:\x3c/b\x3e Hold Ctrl key and drag mouse over schematic "] = "\x3cspan class=\x22glyphicon glyphicon-fullscreen\x22\x3e\x3c/span\x3e \x3cb\x3eZOOM:\x3c/b\x3e Hold Ctrl key and drag mouse over schematic";

i18n["\x3cspan class=\x22glyphicon glyphicon-off \x22\x3e\x3c/span\x3e  Original View"] = "\x3cspan class=\x22glyphicon glyphicon-off\x22\x3e\x3c/span\x3e Original View";

i18n["\x3cspan class=\x22glyphicon glyphicon-resize-horizontal\x22\x3e\x3c/span\x3e   \x3cb\x3ePAN\x3c/b\x3e: Hold Alt key and drag mouse over schematic "] = "\x3cspan class=\x22glyphicon glyphicon-resize-horizontal\x22\x3e\x3c/span\x3e \x3cb\x3ePAN\x3c/b\x3e: Hold Alt key and drag mouse over schematic";

i18n["\x3cspan class=\x22glyphicon glyphicon-zoom-in\x22\x3e\x3c/span\x3e  Zoom In"] = "\x3cspan class=\x22glyphicon glyphicon-zoom-in\x22\x3e\x3c/span\x3e Zoom In";

i18n["\x3cspan class=\x22glyphicon glyphicon-zoom-out\x22\x3e\x3c/span\x3e   Zoom Out"] = "\x3cspan class=\x22glyphicon glyphicon-zoom-out\x22\x3e\x3c/span\x3e Zoom Out";

i18n["Cannot create path highlight element for the swith postion {id}.\x0a Switch position element should be a path, line, polyline or polygon element."] = function(d){return "Cannot create path highlight element for the swith postion "+v(d,"id")+". Switch position element should be a path, line, polyline or polygon element."};

i18n["Circuit type \x3cb\x3e {_circType} \x3c/b\x3e assigned to wire segment with id \x3cb\x3e {id} \x3c/b\x3e does not exist for this slide album."] = function(d){return "Circuit type <b>"+v(d,"_circType")+"</b> assigned to wire segment with id <b>"+v(d,"id")+"</b> does not exist for this slide album."};

i18n["Default position for switch {name} is already set!\x0a Verify that positions are hidden or display attribute is set to \x27none\x27."] = function(d){return "Default position for switch "+v(d,"name")+" is already set! Verify that positions are hidden or display attribute is set to 'none'."};

i18n["File should be named as the svg file with the \x27{ext}\x27 extension:"] = function(d){return "File should be named as the svg file with the '"+v(d,"ext")+"' extension:"};

i18n["Illustrator/SVG markup error:  Cannot determine index for Switch position, {id}.\x0a Naming convention violation."] = function(d){return "Illustrator/SVG markup error: Cannot determine index for Switch position, "+v(d,"id")+". Naming convention violation."};

i18n["Locked by {_username}"] = function(d){return "Locked by "+v(d,"_username")};

i18n["No switch position {_index} found for switch {id}"] = function(d){return "No switch position "+v(d,"_index")+" found for switch "+v(d,"id")};

i18n["Slide {ind}: No switch with id {switchID} is found in the diagram.\x0a"] = function(d){return "Slide "+v(d,"ind")+": No switch with id "+v(d,"switchID")+" is found in the diagram."};

i18n["Slide {ind}: No wire segment with id {wireID} is found in the diagram.\x0a"] = function(d){return "Slide "+v(d,"ind")+": No wire segment with id "+v(d,"wireID")+" is found in the diagram."};

i18n["Username {_username} is bisy. User cannot be created. Please, choose another username."] = function(d){return "Username "+v(d,"_username")+" is bisy. User cannot be created. Please, choose another username."};

i18n["Username {_username} is bisy. User cannot be edited. Please, choose another username."] = function(d){return "Username "+v(d,"_username")+" is bisy. User cannot be edited. Please, choose another username."};

i18n["Warning! This slide album is opened by \x3cb\x3e {_username} \x3c/b\x3e. \x3cbr\x3e You are viewing it in read-only mode."] = function(d){return "Warning! This slide album is opened by <b>"+v(d,"_username")+"</b>.<br>You are viewing it in read-only mode."};

i18n["Wire segment with id \x3cb\x3e {key} \x3c/b\x3e of circuit type {type} does not exist in the diagram."] = function(d){return "Wire segment with id <b>"+v(d,"key")+"</b> of circuit type "+v(d,"type")+" does not exist in the diagram."};

i18n["You have {slideAlbumsCount} slide albums in your workspace"] = function(d){return "You have "+v(d,"slideAlbumsCount")+" slide albums in your workspace"};

}());
