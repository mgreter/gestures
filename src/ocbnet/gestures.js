/*

  Copyright (c) Marcel Greter 2015 - OCBNET Gestures
  This plugin is available for use in all personal or
  commercial projects under both MIT and GPL licenses.

*/

// make sure our global namespace exists
// but do not reset it if already present
if (typeof OCBNET == 'undefined') var OCBNET = {};

// detect chrome for special implementation
var isChromium = window.chrome,
    vendorName = window.navigator.vendor;

// decide if we are going to scroll or pan on first touch move event
// this seems to be the correct implementation for google chrome, altough
// it also seems to work without this and a proper setup for swipeMinDistance
var decideScrollOrPanOnFirst = isChromium !== null && vendorName === "Google Inc.";

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// static array
	var fingers = {};
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
			swipeMinDistance: 15,

			// decide on first touch move handler
			// if we should pan ourself or leave it
			// to the user agent to do the scrolling
			decideOnFirst: decideScrollOrPanOnFirst

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
		// finger may be deleted
		if (fingers[evt.id])
		{
			// update shared finger
			fingers[evt.id].x = evt.x;
			fingers[evt.id].y = evt.y;
		}
	};
	// @@@ EO: fingerup @@@

	// @@@ move all fingers on surface @@@
	// emulate event chain for all gestures
	OCBNET.Gestures.fingermove = function (evt)
	{
		// get all gestures for finger
		var gestures = surface[evt.id];
		// check if we have some gestures
		if (typeof gestures != 'undefined')
		{
			// process all registered gestures
			for(var g = 0, l = gestures.length; g < l; g++)
			{
				// call move for this finger
				gestures[g].fingerMove(evt);
				// exit loop if propagation stopped
				if (evt.isPropagationStopped()) break;
			}
			// update shared finger
			fingers[evt.id].x = evt.x;
			fingers[evt.id].y = evt.y;
		}
	};


	// @@@ move all fingers on surface @@@
	OCBNET.Gestures.fingersmove = function (evt)
	{
		// now process all finger ids
		for (var id in surface)
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
			OCBNET.Gestures.fingermove(event);
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

			// create a local finger for this gesture
			// you decide when to update properties
			var finger = new OCBNET.Gestures.Finger(evt);

			// create a new finger shared across all instances
			if (typeof fingers[evt.id] == 'undefined')
			{ fingers[evt.id] = new OCBNET.Gestures.Finger(evt); }

			// create a new finger down event
			var event = new jQuery.Event('handstart',
			{
				dx: 0, dy: 0,
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

				// increase counter
				gesture.fingers ++;

				// remember maximum fingers on gesture
				if (gesture.maximum < gesture.fingers)
				{ gesture.maximum = gesture.fingers; }

				// add finger to ordered list
				gesture.ordered.push(finger.id);

				// attach finger to gesture
				gesture.finger[finger.id] = finger;

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

				// create surface array
				if (!surface[finger.id])
				{ surface[finger.id] = []; }

				// push finger to surface
				surface[finger.id].push(gesture);

				// create and init a copy for move
				gesture.move = jQuery.extend({}, gesture.start);

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

				// calculate shared delta move
				var dx = fingers[id].x - evt.x,
				    dy = fingers[id].y - evt.y;

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

				// handler options
				var options =
				{
					dx: dx, dy: dy,
					finger: finger,
					gesture: gesture,
					originalEvent: evt
				}

				// trigger hand move event
				// event does not bubbles up
				jQuery(gesture.el).triggerHandler
				(
					new jQuery.Event('handmove', options)
				);

				// check if there is a swipe movement
				if (typeof gesture.swipeSector == 'undefined')
				{
					// check if we have the minimum move/slop distance reached for a swipe
					if (this.config.decideOnFirst || Math.pow(this.config.swipeMinDistance, 2) < deltaX*deltaX + deltaY*deltaY)
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
						new jQuery.Event('handswipe', options)
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
						new jQuery.Event('handtransform', options)
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

				// calculate shared delta move
				var dx = fingers[id].x - evt.x,
				    dy = fingers[id].y - evt.y;

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
					dx: dx, dy: dy,
					finger: finger,
					gesture: gesture
				});

				// only call event on the given element
				// this means the event will not bubble
				jQuery(gesture.el).triggerHandler(event);

				// decrease fingers
				gesture.fingers --;

				// reset some states for now
				// recalulated on next move
				delete gesture.offset;
				delete gesture.rotation;
				delete gesture.distance;
				delete gesture.swipeSector;

				// by default we abort the full hand
				// you may remove finger by finger
				if (event.isDefaultPrevented())
				{
					// get index of finger in current gesture object
					var idx = jQuery.inArray(finger.id, gesture.ordered)
					// remove finger from order array
					gesture.ordered.splice(idx, 1);
					// remove finger from gesture
					delete gesture.finger[id];
				}
				else
				{
					// unset all fingers
					gesture.finger = {};
					gesture.fingers = 0;
					gesture.ordered.length = 0;
				}

				// remove from surface (find index and remove via splice)
				var idx = jQuery.inArray(gesture, surface[id]);
				if (idx != -1) surface[id].splice( idx, 1 );

				// remove statucs if array is empty
				if (surface[id].length == 0)
				{
					delete fingers[id];
					delete surface[id];
				}

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
// EO private scope