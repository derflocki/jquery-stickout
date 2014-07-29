(function($, w, d) {
"use strict";
var scrollFunc = window.requestAnimationFrame ||
	 window.webkitRequestAnimationFrame ||
	 window.mozRequestAnimationFrame ||
	 window.msRequestAnimationFrame ||
	 window.oRequestAnimationFrame ||
	 // IE Fallback
	 function(callback){ callback() },
	 MathMax = MathMax;
/**
	* make event handling as fast as possible
	* @see: http://net.tutsplus.com/tutorials/javascript-ajax/from-jquery-to-javascript-a-reference
	*/
	var addEvent = (function () {
		if ( d.addEventListener ) {
			return function (el, type, fn) {
				el.addEventListener(type, fn, false);
			};
		}
		return function (el, type, fn) {
			el.attachEvent('on' + type, function () { return fn.call(el, w.event); });
		};
	})();
var prop = "transform", prop_template = "matrix(1, 0, 0, 1, 0, %s)", r = /%s/;
var state = {
	b: {
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
	t: {
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
	scrollY: null
};
var scroller = function(e) {
	var scrollY = MathMax(w.pageYOffset, d.body.scrollTop, d.documentElement.scrollTop);
	if(scrollY == state.scrollY) {
		return false;
	}
	var top_new_pos = state.t.pos || 0, top_old_pos = top_new_pos,
		bottom_new_pos = state.b.pos || 0, bottom_old_pos = bottom_new_pos,
		scroll = scrollY - state.scrollY;
	state.scrollY = scrollY;
	top_new_pos = MathMax(-state.t.widgetHeight + state.t.offset, Math.min(0, top_old_pos - scroll));
	bottom_new_pos = MathMax(0, Math.min(state.b.widgetHeight-state.b.offset, bottom_old_pos + scroll));
	if (bottom_new_pos != bottom_old_pos || top_new_pos != top_old_pos) {
		state.b.pos = bottom_new_pos;
		state.t.pos = top_new_pos;
		scrollFunc(updater);
	}
};
//the proper updater is selected in the initialization
var updater = null;
/*
 * top only
 */
var updaterTop = function() {
	state.t.widget[0].style[prop] = prop_template.replace(r, state.t.pos);
};
/*
 * bottom only
 */
var updaterBottom = function() {
	state.b.widget[0].style[prop] = prop_template.replace(r, state.b.pos);
};
/*
 * top and bottom
 */
var updaterTopBottom = function() {
	state.t.widget[0].style[prop] = prop_template.replace(r, state.t.pos);
	state.b.widget[0].style[prop] = prop_template.replace(r, state.b.pos);
};

var css_reset = {'position': '', 'width': ''};
var resizer = function(e) {
	if(state.t.widget) {
		//reset for proper width-calculation
		state.t.widget.css(css_reset);
		state.t.parentWidget.css('margin-top', '');
		//calc outer width
		var oh = state.t.widget.outerHeight(true), ow = state.t.widget.outerWidth(true);

		//set
		state.t.widgetHeight = oh;
		state.t.widgetWidth = ow;
		state.t.css.width = state.t.widgetWidth;

		state.t.widget.css(state.t.css);
		state.t.parentWidget.css('margin-top', state.t.widgetHeight);
	}
	if(state.b.widget) {
		state.b.widget.css(css_reset);
		state.b.parentWidget.css('margin-bottom','');
		var oh = state.b.widget.outerHeight(true), ow = state.b.widget.outerWidth(true);
		
		state.b.widgetHeight = oh;
		state.b.widgetWidth = ow;
		state.b.css.width = state.b.widgetWidth;
		
		state.b.widget.css(state.b.css);
		state.b.parentWidget.css('margin-bottom', state.b.offset);
	}
};
$.stickout = function(options) {
	state.scrollY = 0; // Always start at zero, fixes bug when loading page with initial scroll (location.hash)

	var props = [
		'transform', 
		'webkitTransform', 
		'mozTransform',  
		'oTransform',
		'top'
	];
	var ds = d.body.style; 
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
		state.t.widget = opts.top.widget;
		state.t.offset = opts.top.offset;
		state.t.parentWidget = state.t.widget.parent();
	}
	if(opts.bottom.widget) {
		state.b.widget = opts.bottom.widget;
		state.b.offset = opts.bottom.offset;
		state.b.parentWidget = state.t.widget.parent();
	}
	resizer();
	if(state.t.widget) {
		state.t.widget.css(state.t.css);
		if(state.b.widget) {
			updater = updaterTopBottom;
		} else {
			updater = updaterTop;
		}
	}
	if(state.b.widget) {
		
		state.b.widget.css(state.b.css);
		if(state.t.widget) {
			updater = updaterTopBottom;
		} else {
			updater = updaterBottom;
		}
	}
	addEvent(w, 'scroll', scroller);
	addEvent(w, 'resize', resizer);
	
	//initialize scroller for pages with initial scroll
	if(w.scrollY !== 0) {
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
})(jQuery, window, document);
