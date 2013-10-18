/*

  Copyright (c) Marcel Greter 2011/2013 - OCBNET Gestures 0.0.0
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/;
/*

  Copyright (c) Marcel Greter 2011/2013 - OCBNET Gestures 0.0.0
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/;
// @@@ private scope @@@
(function()
{


	// @@@ private fn: trap @@@
	function trap (handleObj)
	{

		// get current handler for event
		var handler = handleObj.handler;

		// @@@ closure fn: trapped @@@
		var trapped = function (evt)
		{

			// call the original handler first
			var rv = handler.call(this, evt);

			// check if event propagation was disabled
			if (rv == false || evt.isPropagationStopped())
			{

				// store some event attributes
				var type = evt.type,
				    isTrigger = evt.isTrigger,
				    isPropagationStopped = evt.isPropagationStopped,
				    isImmediatePropagationStopped = evt.isImmediatePropagationStopped;

				// add trap prefix to event
				// for custom event on target
				evt.type = 'trap' + evt.type;

				// force custom event propagating
				evt.isPropagationStopped = function () { return false; };
				evt.isImmediatePropagationStopped = function () { return false; }

				// this will bubble up so you can
				// handle that trapped event anyway
				// XXX: Maybe call on parent instead
				jQuery(evt.currentTarget).parent().trigger(evt);

				// restore some event attributes
				evt.type = type; evt.isTrigger = isTrigger;
				if (isPropagationStopped) evt.stopPropagation();
				if (isImmediatePropagationStopped) evt.stopImmediatePropagation();

				// return the same as original handler
				if (typeof rv != 'undefined') return rv;

			}
			// EO if not propagating

		}
		// @@@ EO closure fn: trapped @@@

		// reset given handler
		handleObj.handler = trapped;

	}
	// @@@ EO private fn: trap @@@


	// special event callback
	var special = { add : trap };

	// now register common event types to trap
	jQuery.event.special['mouseup'] = special;
	jQuery.event.special['mouseout'] = special;
	jQuery.event.special['mouseover'] = special;
	jQuery.event.special['mousemove'] = special;
	jQuery.event.special['mousedown'] = special;
	jQuery.event.special['touchend'] = special;
	jQuery.event.special['touchmove'] = special;
	jQuery.event.special['touchstart'] = special;
	jQuery.event.special['touchcancel'] = special;


})()
// @@@ EO private scope @@@
;
/*

  Copyright (c) Marcel Greter 2012 - OCBNET gesture 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

// make sure our global namespace exists
// but do not reset it if already present
if (typeof OCBNET == 'undefined') var OCBNET = {};

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// static array
	var gestures = [];

	// static counter
	var count = 0;

	// store all fingers down at any time
	// used to store some static information
	// each finger can be involved in multiple
	// gesture and it makes it possible to get
	// the associated finger data only with the id
	var surface = {};

	// @@@ Object Constructor @@@
	OCBNET.Gestures = function (el, config)
	{

		// dom element
		this.el = el;

		// create initial configuration
		this.config = jQuery.extend({

			// native features
			// mostly for pan-y
			native: {},

			// in how many angle sectors
			// should swipes be distributed
			swipeSectors: 2,

			// minimum distance to find
			// the appropriate swipe sector
			swipeMinDistance: 20

		}, config, true);

		// assign a static id
		this.id = count ++;

		// add our instance
		gestures.push(this);

		// count fingers
		this.fingers = 0;

		// maximum fingers
		this.maximum = 0;

		// attached fingers
		this.finger = {};

		// finger ids in order
		this.ordered = [];

		// link to static arrays
		this.surface = surface;

		// bind ...
		jQuery(el)
			// do not allow dragging of any gesture elements
			.bind('dragstart', function () { return false; })

		// call all further initializers (mouse/touch)
		for (var i = 0, l = this.init.length; i < l; i++)
		{
			// binds specific event handlers
			this.init[i].apply(this, arguments);
		}

	};
	// @@@ EO Object Constructor @@@

	// @@@ finger got up somewhere on surface @@@
	OCBNET.Gestures.fingerup = function (evt)
	{
		// process all registered gestures
		var g = gestures.length; while (g--)
		{
			// does nothing for unknown finger
			gestures[g].fingerUp(evt);
		}
	};
	// @@@ EO: fingerup @@@

	// @@@ move all fingers on surface @@@
	OCBNET.Gestures.fingermove = function (evt)
	{
		// process all registered gestures
		var g = gestures.length; while (g--)
		{
				// call move for this finger
			gestures[g].fingerMove(evt);
		}
	};


	// @@@ move all fingers on surface @@@
	OCBNET.Gestures.fingersmove = function (evt)
	{
		// process all registered gestures
		var g = gestures.length; while (g--)
		{
			// now process all finger ids
			for (var id in gestures[g].finger)
			{
				// create new fingermove event object
				var event = jQuery.Event('fingermove',
				{
					id : id,
					x : evt.x,
					y : evt.y,
					originalEvent: evt
				});
				// call move for each finger
				gestures[g].fingerMove(event);
			}
		}
	};
	// @@@ EO move all fingers on surface @@@


	// @@@ remove all fingers on surface @@@
	OCBNET.Gestures.fingersup = function (evt)
	{
		// process all registered gestures
		var g = gestures.length; while (g--)
		{
			// now process all finger ids
			for (var id in gestures[g].finger)
			{
				// create new fingermove event object
				var event = jQuery.Event('fingerup',
				{
					id : id,
					x : evt.x,
					y : evt.y,
					originalEvent: evt
				});
				// call move for each finger
				gestures[g].fingerUp(event);
			}
		}
	};
	// @@@ EO remove all fingers on surface @@@


	// @@@ Object Constructor @@@
	OCBNET.Gestures.Finger = function (opt)
	{

		this.id = opt.id;
		this.x = opt.x;
		this.y = opt.y;

	};
	// @@@ EO Object Constructor @@@


	// @@@ Class declaration @@@
	(function (prototype)
	{

		// create objects on prototype
		prototype.init = [];


		// @@@ method: fingerDown @@@
		prototype.fingerDown = function (evt)
		{

			// for optimizer
			var gesture = this;

			// create a new finger (take values from event)
			var finger = new OCBNET.Gestures.Finger(evt);

			// create a new finger down event
			var event = new jQuery.Event('handstart',
			{
				finger: finger,
				gesture: gesture,
				originalEvent: evt
			});

			// only call event on the given element
			// this means the event will not bubble
			jQuery(gesture.el).triggerHandler(event);

			// abort this hand gesture right now
			if (event.isDefaultPrevented()) return;

			// finger not yet known
			if (!this.hasFinger(finger.id))
			{

				// calculations
				gesture.start = {
					center : gesture.getCenter(),
					rotation : gesture.getRotation(),
					distance : gesture.getDistance()
				}

				// offset position
				gesture.offset = { x : 0, y : 0 }
				// get the center from last move
				gesture.center = gesture.start.center;
				// offset rotation and distance
				gesture.rotation = 0; gesture.distance = 0;

				// increase counter
				this.fingers ++;

				// remember maximum fingers on gesture
				if (this.maximum < this.fingers)
				{ this.maximum = this.fingers; }

				// add finger to ordered list
				this.ordered.push(finger.id);

				// attach finger to gesture
				this.finger[finger.id] = finger;

				// attach finger to surface
				surface[finger.id] = finger;

				// calculate status of this gesture
				this.start = {
					center : this.getCenter(),
					rotation : this.getRotation(),
					distance : this.getDistance()
				}

				// create and init a copy for move
				this.move = jQuery.extend({}, this.start);

			}
			// EO if not used

		}
		// @@@ EO method: fingerDown @@@

		// @@@ private fn: fingerMove @@@
		prototype.fingerMove = function(evt)
		{

			// init variables
			var id = evt.id,
			    gesture = this;

			// check that finger is known
			if (gesture.hasFinger(id))
			{

				// get the actual finger instance
				var finger = gesture.getFinger(id);

				// update position
				finger.x = evt.x;
				finger.y = evt.y;

				// calculations
				gesture.move = {
					center : gesture.getCenter(),
					rotation : gesture.getRotation(),
					distance : gesture.getDistance()
				}

				// offset position
				gesture.offset = {
					x : gesture.move.center.x - gesture.start.center.x,
					y : gesture.move.center.y - gesture.start.center.y
				}
				// get the center from last move
				gesture.center = gesture.move.center;
				// offset rotation and distance
				gesture.rotation = gesture.move.rotation - gesture.start.rotation;
				gesture.distance = gesture.move.distance - gesture.start.distance;

				// detect swipes to dispatch by offsets
				var deltaX = Math.abs(gesture.offset.x),
				    deltaY = Math.abs(gesture.offset.y);

				// trigger hand move event
				// event does not bubbles up
				jQuery(gesture.el).triggerHandler
				(
					new jQuery.Event('handmove',
					{
						finger: finger,
						gesture: gesture,
						originalEvent: evt
					})
				);

				// check if there is a swipe movement
				if (typeof gesture.swipeSector == 'undefined')
				{
					// check if we have the minimum move distance reached for a swipe
					if (Math.sqrt(deltaX*deltaX + deltaY*deltaY) > this.config.swipeMinDistance)
					{
						// determine in which sector the swipe was
						// get the rotation of the swipe to match to sector
						var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
						gesture.swipeSector = parseInt(angle / 90 * this.config.swipeSectors, 10);
						gesture.swipeSector = Math.min(gesture.swipeSector, this.config.swipeSectors - 1);
					}
				}
				// EO if no swipe yet

				// check if swipe has been started
				// always keep swipe in same sector
				if (typeof gesture.swipeSector != 'undefined')
				{

					// trigger hand swipe event
					// event does not bubbles up
					jQuery(gesture.el).triggerHandler
					(
						new jQuery.Event('handswipe',
						{
							finger: finger,
							gesture: gesture,
							originalEvent: evt
						})
					);
				}
				// EO if swiping

				// check multifinger gesture
				if (gesture.fingers > 1)
				{
					// trigger hand transform event
					// event does not bubbles up
					jQuery(gesture.el).triggerHandler
					(
						new jQuery.Event('handtransform',
						{
							finger: finger,
							gesture: gesture,
							originalEvent: evt
						})
					);
				}
				// EO if multifinger gesture

			}
			// EO if finger is known

		}
		// @@@ EO method: fingerMove @@@


		// @@@ method: fingerUp @@@
		prototype.fingerUp = function (evt)
		{

			// init variables
			var id = evt.id,
			    gesture = this;

			// finger was used
			if (gesture.hasFinger(id))
			{

				// get the actual finger instance
				var finger = gesture.getFinger(id);

				// update position
				finger.x = evt.x;
				finger.y = evt.y;

				// calculations
				gesture.stop = {
					center : gesture.getCenter(),
					rotation : gesture.getRotation(),
					distance : gesture.getDistance()
				}

				// offset position
				gesture.offset = {
					x : gesture.stop.center.x - gesture.start.center.x,
					y : gesture.stop.center.y - gesture.start.center.y
				}
				// get the center from last move
				gesture.center = gesture.stop.center;
				// offset rotation and distance
				gesture.rotation = gesture.stop.rotation - gesture.start.rotation;
				gesture.distance = gesture.stop.distance - gesture.start.distance;

				// create a new finger down event
				var event = new jQuery.Event('handstop',
				{
					finger: finger,
					gesture: gesture
				});

				// only call event on the given element
				// this means the event will not bubble
				jQuery(gesture.el).triggerHandler(event);

				// abort this hand gesture right now
				// if (finger.isDefaultPrevented()) return;

				// decrease fingers
				gesture.fingers --;

				// stop swipe movement
				delete gesture.offset;
				delete gesture.rotation;
				delete gesture.distance;
				delete gesture.swipeSector;

				// get index of finger in current gesture
				var idx = jQuery.inArray(finger.id, gesture.ordered)

				// remove finger from order array
				gesture.ordered.splice(idx, 1);

				// remove the finger from the gesture
				delete gesture.finger[finger.id];

				// remove finger from surface
				delete surface[finger.id];

			}
			// EO if used

		};
		// @@@ EO method: fingerUp @@@


		// @@@ method: getCenter @@@
		prototype.getCenter = function ()
		{

			// create center object
			var center = { x : 0, y : 0 };

			// sum up all attributes
			for (var id in this.finger)
			{
				// get finger from this gesture
				var finger = this.finger[id];
				// sum up all finger positions
				center.x += finger.x; center.y += finger.y;
			}
			// EO each finger

			// normalize x/y value
			if (this.fingers)
			{
				center.x /= this.fingers;
				center.y /= this.fingers;
			}

			// return center
			return center;

		};
		// @@@ EO method: getCenter @@@


		// @@@ method: getRotation @@@
		prototype.getRotation = function ()
		{

			// need at least 2 fingers
			if (this.fingers < 2) return 0;

			// declare variables
			var x = 0, y = 0, c = 0;

			// process all fingers down for this gesture
			for (var i = 0, l = this.ordered.length; i < l; i++)
			{

				// get the first finger
				var i_id = this.ordered[i],
				    i_finger = this.finger[i_id];

				// process all other fingers
				for (var n = i + 1; n < l; n++)
				{

					// increase counter
					c ++;

					// get the second finger
					var n_id = this.ordered[n],
					    n_finger = this.finger[n_id];

					// get the distance on each axis
					x += (n_finger.x - i_finger.x);
					y += (n_finger.y - i_finger.y);

				}
				// EO process other fingers

			}
			// EO process all fingers

			// normalize values
			x /= c; y /= c;

			// return the calulcated rotation angle
			return Math.atan2(y, x) * 180 / Math.PI;

		};
		// @@@ EO method: getRotation @@@


		// @@@ method: getDistance @@@
		prototype.getDistance = function ()
		{

			// need at least 2 fingers
			if (this.fingers < 2) return 0;

			// declare variables
			var x = 0, y = 0, c = 0;

			// process all fingers down for this gesture
			for (var i = 0, l = this.ordered.length; i < l; i++)
			{

				// get the first finger
				var i_id = this.ordered[i],
				    i_finger = this.finger[i_id];

				// process all other fingers
				for (var n = i + 1; n < l; n++)
				{

					// increase counter
					c ++;

					// get the second finger
					var n_id = this.ordered[n],
					    n_finger = this.finger[n_id];

					// get the absolute distance on each axis
					x += Math.abs(n_finger.x - i_finger.x);
					y += Math.abs(n_finger.y - i_finger.y);

				}
				// EO process other fingers

			}
			// EO process all fingers

			// normalize values
			x /= c; y /= c;

			// calculate distance
			return Math.sqrt(x*x + y*y);

		};
		// @@@ EO method: getDistance @@@

		// @@@ method: hasFinger @@@
		prototype.hasFinger = function (id)
		{

			// return if id is known
			return id in this.finger;

		}
		// @@@ EO method: hasFinger @@@

		// @@@ method: hasFinger @@@
		prototype.getFinger = function (id)
		{

			// return finger instance
			return this.finger[id];

		}
		// @@@ EO method: hasFinger @@@

	})(OCBNET.Gestures.prototype);
	// @@@ EO Class declaration @@@


	// @@@ jQuery fn: gesture @@@
	jQuery.fn.gesture = function (config)
	{

		// process all elements in collection
		jQuery(this).each(function (i, el)
		{

			// get the gesture data from element
			// only one gesture for each element
			var gesture = jQuery(el).data('gesture');

			// check if element is not initialised
			if (typeof gesture == 'undefined')
			{

				// create a new gesture object
				// also binds start events to el
				gesture = new OCBNET.Gestures(el, config);

				// store the object on the element
				jQuery(el).data('gesture', gesture);

			}
			// EO if gesture not initialised

			// if gesture is initialised
			else
			{

				// assertion for config change
				if (gesture.fingers > 0)
				{
					// only allow initial config changes
					throw('fatal: live config change');
				}

				// extend the gesture config object
				jQuery.extend(gesture.config, config, true);

			}
			// EO if gesture is initialised

		});
		// EO each element

		// chainable
		return this;

	}
	// @@@ EO jQuery fn: gesture @@@

})(jQuery);
// EO private scope;
/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// check for touch features
	if ( 'ontouchstart' in window ) return;
	// proper detection for ie10 on desktop (https://github.com/CreateJS/EaselJS/issues/273)
	if ( window.navigator['msPointerEnabled'] && window.navigator["msMaxTouchPoints"] > 0 ) return;

	// extend class
	(function(prototype)
	{

		// bind additional events for gestures
		prototype.init.push(function (el)
		{

			// create a closure
			var closure = this;

			// trap mousedown locally on each element
			jQuery(el).bind('mousedown', function (evt)
			{

				// get variables from event
				var el = evt.currentTarget,
				    org = evt.originalEvent;

				// get the gesture for current element
				// it should be here, otherwise I don't know
				// why I would be registered on this element
				var gesture = jQuery(el).data('gesture');

				// assertion for same object (play safe - dev)
				if (gesture !== closure) eval("alert('assertion')");

				// create new finger down event object
				// you may use it to cancel event bubbeling
				var finger = new jQuery.Event('fingerdown',
				{
					type : 'mouse',
					id : evt.which,
					x : evt.screenX,
					y : evt.screenY,
					originalEvent : evt
				});

				// pass on to gesture handler
				gesture.fingerDown(finger)

			})

		});
		// EO bind additional events for gestures

	})(OCBNET.Gestures.prototype);
	// EO extend class


	// trap mouseup globally, "trap" for all cases
	jQuery(document).bind('mouseup trapmouseup', function (evt)
	{

		// mouseup outside of viewport?
		// this is known to be very buggy!
		if (
			evt.clientX < 0 || evt.clientY < 0 ||
			evt.clientX > jQuery(window).width() ||
			evt.clientY > jQuery(window).height()
		)
		{

			// create new finger object
			var event = new jQuery.Event('fingersup',
			{
				type : 'mouse',
				x : evt.screenX,
				y : evt.screenY,
				originalEvent: evt
			});

			// release all buttons at once
			OCBNET.Gestures.fingersup(event);

		}
		else
		{

			// create new finger object
			var event = new jQuery.Event('fingerup',
			{
				type : 'mouse',
				id : evt.which,
				x : evt.screenX,
				y : evt.screenY,
				originalEvent: evt
			})

			// only release the specific button
			OCBNET.Gestures.fingerup(event);

		}

	})
	// EO mouseup

	// trap mousemove globally, "trap" for all cases
	jQuery(document).bind('mousemove', function (evt)
	{

		// create new fingersmove event object
		var event = jQuery.Event('fingersmove',
		{
			type : 'mouse',
			x : evt.screenX,
			y : evt.screenY,
			originalEvent: evt
		});

		// always move all fingers at once
		OCBNET.Gestures.fingersmove(event);

	})
	// EO mousemove

})(jQuery);
// EO private scope;
/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// check for touch features
	if ( ! ('ontouchstart' in window) ) return;
	// proper detection for ie10 on desktop (https://github.com/CreateJS/EaselJS/issues/273)
	if ( window.navigator['msPointerEnabled'] && window.navigator["msMaxTouchPoints"] > 0 ) return;

	// extend class
	(function(prototype)
	{

		// bind additional events for gestures
		prototype.init.push(function (el)
		{

			// create a closure
			var closure = this;

			// trap mousedown locally on each element
			jQuery(el).bind('touchstart', function (evt)
			{

				// get variables from event
				var el = evt.currentTarget,
				    org = evt.originalEvent,
				    touches = org.changedTouches || [];

				// get the gesture for current element
				// it should be here, otherwise I don't know
				// why I would be registered on this element
				var gesture = jQuery(el).data('gesture');

				// assertion for same object (play safe - dev)
				if (gesture !== closure) eval("alert('assertion')");

				// process all newly added fingers
				jQuery(touches).each(function (i, touch)
				{

					// create new finger down event object
					// you may use it to cancel event bubbeling
					var event = new jQuery.Event('fingerdown',
					{
						type : 'touch',
						x : touch.screenX,
						y : touch.screenY,
						id : touch.identifier,
						originalEvent : evt
					});

					// pass on to gesture handler
					gesture.fingerDown(event)

				});

			})

			// trap mousedown locally on each element
			jQuery(el).bind('handswipe', function (evt)
			{
				// only support default configuration option
				if (evt.gesture.config.swipeSectors == 2)
				{
					// tested only on andoid so far (from experience could work on ipad too)
					if (evt.gesture.swipeSector === 0 && evt.gesture.config.native.panY) evt.preventDefault();
					if (evt.gesture.swipeSector === 1 && evt.gesture.config.native.panX) evt.preventDefault();
				}
			});

		});
		// EO bind additional events for gestures

	})(OCBNET.Gestures.prototype);
	// EO extend class


	// trap touchend globally, "trap" for all cases
	jQuery(document).bind('touchend touchcancel', function (evt)
	{

		// get variables from the event object
		var org = evt.originalEvent,
				touches = org.changedTouches || [];

		// process all newly added fingers
		jQuery(touches).each(function (i, touch)
		{

			// create new finger object
			var event = jQuery.Event('fingerup',
			{
				type : 'touch',
				x : touch.screenX,
				y : touch.screenY,
				id : touch.identifier,
				originalEvent: evt
			});

			// only release the specific button
			OCBNET.Gestures.fingerup(event);

		});

	})
	// EO touchend


	// trap mousemove globally, "trap" for all cases
	// this will be called for every pointer that moved
	jQuery(document).bind('touchmove', function (evt)
	{

		// get variables from the event object
		var org = evt.originalEvent,
				touches = org.changedTouches || [];

		// process all newly added fingers
		jQuery(touches).each(function (i, touch)
		{

			// create new fingermove event object
			var event = jQuery.Event('fingermove',
			{
				type : 'touch',
				x : touch.screenX,
				y : touch.screenY,
				id : touch.identifier,
				originalEvent: evt
			});

			// always move all fingers at once
			OCBNET.Gestures.fingermove(event);

		});

	})
	// EO MSPointerMove


})(jQuery);
// EO private scope
;
/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// proper detection for ie10 on desktop (https://github.com/CreateJS/EaselJS/issues/273)
	if ( ! (window.navigator['msPointerEnabled'] && window.navigator["msMaxTouchPoints"] > 0) ) return;

	// extend class
	(function(prototype)
	{

		// bind additional events for gestures
		prototype.init.push(function (el)
		{

			// create a closure
			var closure = this;

			// trap mousedown locally on each element
			jQuery(el).bind('MSPointerDown', function (evt)
			{

				// get variables from event
				var el = evt.currentTarget,
				    org = evt.originalEvent;

				// get the gesture for current element
				// it should be here, otherwise I don't know
				// why I would be registered on this element
				var gesture = jQuery(el).data('gesture');

				// assertion for same object (play safe - dev)
				if (gesture !== closure) eval("alert('assertion')");

				// create new finger down event object
				// you may use it to cancel event bubbeling
				var finger = new jQuery.Event('fingerdown',
				{
					type : 'pointer',
					x : org.pageX,
					y : org.pageY,
					id : org.pointerId,
					originalEvent : evt
				});

				// pass on to gesture handler
				gesture.fingerDown(finger)

			})
			// taken from inet sources
			.css('msTouchAction', 'none')

		});
		// EO bind additional events for gestures

	})(OCBNET.Gestures.prototype);
	// EO extend class


	// trap mouseup globally, "trap" for all cases
	jQuery(document).bind('MSPointerUp', function (evt)
	{

		// get variables from the event object
		var org = evt.originalEvent;

		// create new finger object
		var event = new jQuery.Event('fingerup',
		{
			type : 'pointer',
			x : org.pageX,
			y : org.pageY,
			id : org.pointerId,
			originalEvent: evt
		})

		// only release the specific button
		OCBNET.Gestures.fingerup(event);

	})
	// EO MSPointerUp


	// trap mousemove globally, "trap" for all cases
	// this will be called for every pointer that moved
	jQuery(document).bind('MSPointerMove', function (evt)
	{

		// get variables from the event object
		var org = evt.originalEvent;

		// create new finger object
		var event = jQuery.Event('fingermove',
		{
			type : 'pointer',
			x : org.pageX,
			y : org.pageY,
			id : org.pointerId,
			originalEvent: evt
		});

		// move just one finger at once
		OCBNET.Gestures.fingermove(event);

	})
	// EO MSPointerMove


})(jQuery);
// EO private scope