(function($) {
var scrollFunc = window.requestAnimationFrame ||
	 window.webkitRequestAnimationFrame ||
	 window.mozRequestAnimationFrame ||
	 window.msRequestAnimationFrame ||
	 window.oRequestAnimationFrame ||
	 // IE Fallback
	 function(callback){ callback() };
	/**
	* make event handling as fast as possible
	* @see: http://net.tutsplus.com/tutorials/javascript-ajax/from-jquery-to-javascript-a-reference
	*/

	var addEvent = (function () {
		var filter = function(el, type, fn) {
			for ( var i = 0, len = el.length; i < len; i++ ) {
				addEvent(el[i], type, fn);
			}
		};
		if ( document.addEventListener ) {
			return function (el, type, fn) {
				if ( el && el.nodeName || el === window ) {
					el.addEventListener(type, fn, false);
				} else if (el && el.length) {
					filter(el, type, fn);
				}
			};
		}
		return function (el, type, fn) {
			if ( el && el.nodeName || el === window ) {
				el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
			} else if ( el && el.length ) {
				filter(el, type, fn);
			}
		};
	})();
var prop = "transform", prop_template = "matrix(1, 0, 0, 1, 0, %s)", r = /%s/,
state = {
	bottom: {
		offset: 0,
		widgetHeight: 0,
		widget: null,
		parentWidget: null,
		css: {
			bottom: 0,
			left: 0,
			right: 0,
			position: 'fixed'
		}
	},
	top: {
		offset: 0,
		widgetHeight: 0,
		widget: null,
		parentWidget: null,
		css: {
			top: 0,
			left: 0,
			right: 0,
			position: 'fixed'
		}
	},
	scrollY: null,
};
var scroller = function(e) {
	var scrollY = window.pageYOffset;
	if(scrollY == state.scrollY) {
		return false;
	}
	var top_new_pos = state.top.pos || 0, top_old_pos = top_new_pos,
		bottom_new_pos = state.bottom.pos || 0, bottom_old_pos = bottom_new_pos,
		scroll = scrollY - state.scrollY;
	state.scrollY = scrollY;
	top_new_pos = Math.max(-state.top.widgetHeight + state.top.offset, Math.min(0, top_old_pos - scroll));
	bottom_new_pos = Math.max(0, Math.min(state.bottom.widgetHeight-state.bottom.offset, bottom_old_pos + scroll));
	if (bottom_new_pos != bottom_old_pos || top_new_pos != top_old_pos) {
		state.bottom.pos = bottom_new_pos;
		state.top.pos = top_new_pos;
		scrollFunc(updater);
	}
};
//the proper updater is selected in the initialization
var updater = null;
/*
 * top only
 */
var updaterTop = function() {
	state.top.widget[0].style[prop] = prop_template.replace(r, state.top.pos);
};
/*
 * bottom only
 */
var updaterBottom = function() {
	state.bottom.widget[0].style[prop] = prop_template.replace(r, state.bottom.pos);
};
/*
 * top and bottom
 */
var updaterTopBottom = function() {
	state.top.widget[0].style[prop] = prop_template.replace(r, state.top.pos);
	state.bottom.widget[0].style[prop] = prop_template.replace(r, state.bottom.pos);
};

var css_reset = {'position': '', 'width': ''};
var resizer = function(e) {
	if(state.top.widget) {
		//reset for proper width-calculation
		state.top.widget.css(css_reset);
		state.top.parentWidget.css('margin-top', '');
		//calc outer width
		var oh = state.top.widget.outerHeight(true), ow = state.top.widget.outerWidth(true);

		//set
		state.top.widgetHeight = oh;
		state.top.widgetWidth = ow;
		state.top.css.width = state.top.widgetWidth;

		state.top.widget.css(state.top.css);
		state.top.parentWidget.css('margin-top', state.top.widgetHeight);
	}
	if(state.bottom.widget) {
		state.bottom.widget.css(css_reset);
		state.bottom.parentWidget.css('margin-bottom','');
		var oh = state.bottom.widget.outerHeight(true), ow = state.bottom.widget.outerWidth(true);
		
		state.bottom.widgetHeight = oh;
		state.bottom.widgetWidth = ow;
		state.bottom.css.width = state.bottom.widgetWidth;
		
		state.bottom.widget.css(state.bottom.css);
		state.bottom.parentWidget.css('margin-bottom', state.bottom.offset);
	}
};
$.stickout = function(options) {
	state.scrollY = 0; // Always start at zero, fixes bug when loading page with initial scroll (location.hash)

	var props = ['transform', 
		'webkitTransform', 
		'mozTransform',  
		'oTransform',
		'top'
	];
	var ds = document.body.style; 
	for (var i=0;i<props.length; i++) {
		if(props[i] in ds) {
			prop = props[i];
			break;
		}
	}
	if(prop === "top") {
		prop_template = "%spx";
	}
	var opts = $.extend({}, $.stickout.defaults, options);
	if(opts.top.widget) {
		state.top.widget = opts.top.widget;
		state.top.offset = opts.top.offset;
		state.top.parentWidget = state.top.widget.parent();
	}
	if(opts.bottom.widget) {
		state.bottom.widget = opts.bottom.widget;
		state.bottom.offset = opts.bottom.offset;
		state.bottom.parentWidget = state.top.widget.parent();
	}
	resizer();
	if(state.top.widget) {
		state.top.widget.css(state.top.css);
		if(state.bottom.widget) {
			updater = updaterTopBottom;
		} else {
			updater = updaterTop;
		}
	}
	if(state.bottom.widget) {
		
		state.bottom.widget.css(state.bottom.css);
		if(state.top.widget) {
			updater = updaterTopBottom;
		} else {
			updater = updaterBottom;
		}
	}
	addEvent(window, 'scroll', scroller);
	addEvent(window, 'resize', resizer);
	
	//initialize scroller for pages with initial scroll
	if(window.scrollY !== 0) {
		scroller();
	}
	return this;
};
$.stickout.defaults = {
	top: {
		widget: null,
		offset: 0
	},
	bottom: {
		widget: null,
		offset: 0
	}
};
})(jQuery);
