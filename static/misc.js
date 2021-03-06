jQuery.fn.log = function (msg) {
    if (typeof window.console != 'undefined' && console.log)
        if (msg) console.log(msg+": %o", this);
        else console.log(this);
    return this;
};

// it says if any element of the set is exceeding its clipping area 
jQuery.fn.isOverflowed = function(HorV) {
    var res = false;
    if (HorV) HorV = HorV[0].toUpperCase(); // so it accepts even 'horizontally'
	this.each(function(){
	    var v = this.clientHeight < this.scrollHeight;
        var h = this.clientWidth < this.scrollWidth;       
        return res = (!HorV ? h||v : (HorV == 'H' ? h : v));
    });
    return res;
}; // isOverflowed

/** ensure the element is verticaly visible */ 
jQuery.fn.scrollToMe = function(options){
    if (!this.size()) return;
    var top = this.offset().top;
    var bottom = top+this.outerHeight();
    var scrollY = jQuery(document).scrollTop();
    var go;
    if (top < scrollY) {
        go = top; // on top?
    }
    else if (bottom > scrollY+innerHeight) { // below?
        go = Math.min(top, bottom-innerHeight);
    }
    if (go) {
        $('html,body').stop(true).animate({ scrollTop: go }, options);
    }
    return this;
}; // scrollToMe

var log = function() {
    if (typeof window.console != 'undefined' && console.log) {
        var last;
        for (var k in arguments)
            console.log(last = arguments[k]);
    }
    return last;
}; // log

function isTransparent(color) {
    if (!color || color == "transparent") return true;
    var m = color.match(/rgba *\( *(\d+) *, *(\d+) *, *(\d+) *, *(\d+) *\)/);
    return m && !Number(m[4]);
} // isTransparent

// returns the supposed background color of the item, traversing upward the DOM and skipping transparent elements  
jQuery.fn.getClosestBackgroundColor = function() {
    if (!this.size()) return '';
    var el = this.first();
    while (1) {
        try { // try, because it comes to the point the element is not an HTMLelement, and css() explodes 
            var c = el.css('background-color');
            if (!isTransparent(c)) return c;
            el = el.parent();
        } 
        catch(err) { return '' }
    }
} // getClosestBackgroundColor
        
function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
} // setCookie

function getCookie(name) {    
    var a = document.cookie.match(new RegExp('(^|; *)('+name+'=)([^;]*)'));
    return (a && a[2]) ? a[3] : null;
} // getCookie

function delCookie(name) {
	setCookie(name,"",-1);
} // delCookie

function getFileExt(path) {
    var v = path.match(/\.([^/.]+)$/);
    return v ? v[1] : '';       
} // getFileExt

function nameToType(name) {
    switch (getFileExt(name).low()) {
        case 'jpg': case 'jpeg': case 'gif': case 'png':
            return 'image';
        case 'avi': case 'mpg': case 'mp4': case 'mov':
            return 'video';
        default:
            return ''; 
    }
} // nameToType

// tries to access a deep property of object, following array "path" as for properties names   
function getDeep(obj, path) {
    for (var i=0, a=path, l=a.length; obj && i<l; ++i) {
        obj = obj[a[i]];
    }
    return obj;         
} // getDeep

function assert(condition, message) {
    if (!condition) alert('ASSERTION ERROR: '+message);
    return !condition;
} // assert
 
function formatBytes(n) {
    if (isNaN(Number(n))) return 'N/A';
    var x = [ '', 'K', 'M', 'G', 'T' ];
    var prevMul = 1;
    var mul = prevMul*1024;
    for (var i=0, l=x.length; i<l && n > mul; ++i) {
        prevMul = mul;
        mul *= 1024;
    }
    n /= prevMul;
    var c = x[i];
    if (c) c = ' '+c;
    return round(n,1)+c;
} // formatBytes

round = function(v, decimals) {
    decimals = Math.pow(10, decimals||0);
    return Math.round(v*decimals)/decimals;
} // round

function cmp(a,b) { return a>b ? 1 : a<b ? -1 : 0 }

function getPicURI(file) { return "/~/pics/"+file+".png"; }

function getIconURI(icon) { return "/~/pics/files/"+icon+".png"; }

function animate(object, property, endValue, options) {
    options = options||{};
    var freq = options.freq||30; // Hz
    var duration = options.duration||0.5; // seconds
    var steps = freq*duration; // number of steps to the end
    if (!object || !property || !steps) return;
    var trackingKey = 'animation_running_'+property;
    var endParameter = { canceling:1 }; // at this stage, calling end() will inform the callback that we have been canceled by another animation 
    
    var end = function(){        
        object[property] = endValue;
        clearInterval(object[trackingKey]);
        delete object[trackingKey];
        if (typeof options.onEnd == 'function') {
            options.onEnd(endParameter);
        }
    };
    
    if (object[trackingKey]) {
        end(); // terminate previous        
    }    
    // we passed the stage of the cancellation
    delete endParameter.canceling;
    if (Object.keys(endParameter).length === 0) {
        endParameter = undefined;
    }
    
    var from;
    var current;
    var inc;
    // track this operation. It would be nice to do it without touching, but we'd need an hash/id of the object, and i don't know a way to get it.            
    object[trackingKey] = setInterval(function(){
        if (typeof from === 'undefined') { // initialize
            from = current = Number(object[property]);
            inc = (endValue-from)/steps;
        }
        object[property] = current += inc;
        if (! --steps) end();
    }, 1000/freq);
} // animate

function removeBrowserSelection() {
    if (window.getSelection) {  // all browsers, except IE before version 9
        return getSelection().removeAllRanges();
    }
    if (document.selection.createRange) {        // Internet Explorer
        var range = document.selection.createRange();
        document.selection.empty();
    }
} // removeBrowserSelection

function basename(path) {
    path = path.excludeTrailing('/');
    var i = path.length-1;
    i = Math.max(path.lastIndexOf('/',i), path.lastIndexOf('\\',i));
    return path.substr(i+1);
} // basename

function dirname(path) {
    path = path.excludeTrailing('/');
    return path.substr(0, path.length-basename(path).length);
} // dirname

/** for now it's only a place-holder. We'll be able to transform data in a way to optimize socket.io communications */  
function ioData(x) { return x }

/* CURRENTLY UNUSED

// reports how many pixels the element is exceeding the viewport, on the right side
jQuery.fn.overRightEdge = function() {
	var w = $(window),
        v = this.offset().left - w.scrollLeft() + this.outerWidth() - w.width();
    return Math.max(0, v);  
}; // overRightEdge

// reports how many pixels the element is exceeding the viewport, on the bottom side
jQuery.fn.overBottomEdge = function() {
	var w = $(window),
        v = this.offset().top - w.scrollTop() + this.outerHeight() - w.height();
    return Math.max(0, v);  
}; // overBottomEdge

*/
