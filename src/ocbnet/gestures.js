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

	// store all fingers down at any time
	// used to store some static information
	// each finger can be involved in multiple
	// gesture and it makes it possible to get
	// the associated finger data only with the id
	var surface = {};

	// store all elements that have some gesture attached
	// needed only to dispatch mousemove events to all nodes
	var elements = [];

	// in how many angle sectors should swipes be allowed
	var swipeSectors = 2, swipeMinDistance = 20;

	// @@@ Object Constructor @@@
	OCBNET.Gestures = function (el)
	{

		// dom element
		this.el = el;

		// attached fingers
		this.hands = [];

		// count fingers
		this.fingers = 0;

		// maximum fingers
		this.maximum = 0;

		// attached fingers
		this.finger = {};

		// fingers in order
		this.ordered = [];

		// event handlers
		this.handlers = {};

		// link to static arrays
		this.surface = surface;
		this.elements = elements;

		// bind ...
		jQuery(el)
			// ... to our custom finger events
			.bind('fingerup', jQuery.proxy(this.fingerUp, this))
			.bind('fingerdown', jQuery.proxy(this.fingerDown, this))
			// do not allow dragging of any gesture elements
			.bind('dragstart', function () { return false; })

		// call all further initializers (mouse/touch)
		for (var i = 0, l = this.init.length; i < l; i++)
		{ this.init[i].apply(this, arguments); }

		// add element to array
		elements.push(jQuery(el));

	};
	// @@@ EO Object Constructor @@@

	// @@@ Object Constructor @@@
	OCBNET.Gestures.Hand = function ()
	{
	};
	// @@@ EO Object Constructor @@@

	// @@@ Object Constructor @@@
	OCBNET.Gestures.Finger = function ()
	{
	};
	// @@@ EO Object Constructor @@@

	// @@@ Class declaration @@@
	(function (prototype)
	{

		// create objects on prototype
		prototype.init = [];
		prototype.handler = {};

		// @@@ method: handle @@@
		prototype.handle = function (evt)
		{

			// get original event object
			var original = evt.originalEvent;

			// check if this event has already
			// been handled by this gesture handler
			// IE 7 only preserves strings for data
			if (!original.data)
			{

				// remember that we already consumed
				// this event to emit gesture events
				original.data = true;

				// get the normalized event type string
				var type = evt.type.replace(/^trap/, '');

				// check for event handler
				if (this.handler[type])
				{
					// call the registered event handler
					this.handler[type].apply(this, arguments);
				}
				else
				{
					// throw an error if the type is not valid
					throw('Gesture cannot handle unknown event', type)
				}

			}
			// EO if already consumed

		}
		// @@@ method: handle @@@

		// @@@ method: fingerDown @@@
		prototype.fingerDown = function (evt)
		{


			// get local variables
			var el = jQuery(evt.currentTarget),
			    finger = evt.finger,
			    gesture = el.data('gesture'),
			    handlers = gesture.handlers;

			// check if the finger should be taken for this gesture
			// XXX - maybe there is a better way to accomplish this
			if (
				jQuery.isFunction(handlers.start)
					? handlers.start.call(gesture, evt, finger)
					: handlers.start
			)
			{

				// get index of finger in current gesture
				// this should not happend, but play safe anyway
				var idx = jQuery.inArray(finger.id, gesture.ordered);

				// finger not yet known
				if (idx == -1)
				{

					// increase finger fingers
					gesture.fingers ++;

					// remember maximum fingers on gesture
					if (gesture.maximum < gesture.fingers)
					{ gesture.maximum = gesture.fingers; }

					// reset cached data
					gesture.cached = {};

					// add finger to ordered list
					gesture.ordered.push(finger.id);

					// attach finger to gesture
					gesture.finger[finger.id] = finger;

					// attach finger to surface
					surface[finger.id] = finger;

					// calculate status of this gesture
					gesture.start = {
						center : gesture.getCenter(),
						rotation : gesture.getRotation(),
						distance : gesture.getDistance()
					}

					// create and init a copy for move
					gesture.move = jQuery.extend({}, gesture.start);

				}
				// EO if not used

			}
			// EO if finger taken

		};
		// @@@ EO method: fingerDown @@@

		// @@@ method: fingersMove @@@
		prototype.fingersMove = function (fingers, evt)
		{

			// process all registered elements
			var e = elements.length; while (e--)
			{

				// collect local changes
				var localchanges = [];

				// get the gesture data from local element
				var gesture = elements[e].data('gesture'),
				    handlers = gesture.handlers;

				// check all fingers on the gesture for changes
				for (var localid in gesture.finger)
				{
					// process all fingers on current move
					var l = fingers.length; while (l--)
					{
						// use changed finger if on gesture
						if (fingers[l].id == localid)
						{ localchanges.push(fingers[l]); }
					}
				}
				// EO check fingers on gesture

				// check if this gesture has changes
				if (localchanges.length)
				{

					delete gesture.cached.center;

					// update the changed fingers on gesture
					var i = localchanges.length; while (i--)
					{
						var finger = localchanges[i];
						gesture.finger[finger.id] = finger;
					}

					// calculate status of this gesture
					gesture.move = {
						center : gesture.getCenter(),
						rotation : gesture.getRotation(),
						distance : gesture.getDistance()
					}

					// calculate status of this gesture
					gesture.center = gesture.move.center;
					gesture.rotation = gesture.move.rotation;
					gesture.distance = gesture.move.distance;

					// detect swipes to dispatch by center offsets
					var mx = gesture.move.center.x,
					    my = gesture.move.center.y,
					    sx = gesture.start.center.x,
					    sy = gesture.start.center.y,
					    deltaX = Math.abs(mx - sx),
					    deltaY = Math.abs(my - sy);

					// call the move function on the gesture object
					if (jQuery.isFunction(handlers.move))
					{ handlers.move.call(gesture, localchanges, evt); }

					// check if there is a swipe handler
					if (jQuery.isFunction(handlers.swipe))
					{

						// check if there is a swipe movement
						if (typeof gesture.swipeSector == 'undefined')
						{
							// check if we have the minimum move distance reached for a swipe
							if (Math.sqrt(deltaX*deltaX + deltaY*deltaY) > swipeMinDistance)
							{
								// determine in which sector the swipe was
								// get the rotation of the swipe to match to sector
								var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
								gesture.swipeSector = parseInt(angle / 90 * swipeSectors, 10);
								gesture.swipeSector = Math.min(gesture.swipeSector, swipeSectors - 1);
							}
						}
						// EO if no swipe yet

						// check if swipe has been started
						// always keep swipe in same sector
						if (typeof gesture.swipeSector != 'undefined')
						{
							// call the move function on the handlers object
							handlers.swipe.call(gesture, gesture.swipeSector, localchanges, evt);
						}
						// EO if swiping

					}
					// EO if swipe handler

					// call the transform function on the handlers object
					if (jQuery.isFunction(handlers.transform))
					{ handlers.transform.call(gesture, localchanges, evt); }

				}
				// check for local changes

			}
			// EO process all elements
		};
		// @@@ EO method: fingersMove @@@


		// @@@ method: fingerUp @@@
		prototype.fingerUp = function (evt)
		{

			// get local variables
			var el = jQuery(evt.currentTarget),
			    finger = evt.finger,
			    gesture = el.data('gesture'),
			    handlers = gesture.handlers;

			// get index of finger in current gesture
			var idx = jQuery.inArray(finger.id, gesture.ordered)

			// finger was used
			if (idx != -1)
			{

				// reset cached data
				// gesture.cached = {};

				// call the stop function on gesture
				if (jQuery.isFunction(handlers.stop))
				{ handlers.stop.call(gesture, finger, evt); }

				// calculate status of this gesture
				gesture.stop = {
					center : gesture.getCenter(),
					rotation : gesture.getRotation(),
					distance : gesture.getDistance()
				}

				// calculate status of this gesture
				gesture.center = gesture.stop.center;
				gesture.rotation = gesture.stop.rotation;
				gesture.distance = gesture.stop.distance;

				// stop swipe movement
				delete gesture.swipeSector;

				// decrease fingers
				gesture.fingers --;

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

			// check if cached value exists
			if (this.cached.center)
			{ return this.cached.center; }

			// create center object
			var center = {};

			// init variables to calculate the center point of all fingers
			var attrs = ['page', 'client', 'screen'], axes = ['X', 'Y'];

			// sum up all attributes
			for (var localid in this.finger)
			{
				// get finger from this gesture
				var finger = this.finger[localid];
				// process all attributes
				var n = attrs.length; while (n--)
				{
					// process all aces
					var i = axes.length; while (i--)
					{
						// combine attribute string
						var attr = attrs[n] + axes[i];
						// initialize attribute on center object
						if (!center[attr]) { center[attr] = 0; }
						// add the current point and divide by fingers
						center[attr] += finger[attr] / this.fingers;
					}
					// EO each axis
				}
				// EO each attribute
			}
			// EO each finger

			// normalize x/y value
			center.x = center.screenX;
			center.y = center.screenY;

			// remember the cached value
			this.cached.center = center;

			// return center
			return center;

		};
		// @@@ EO method: getCenter @@@

		// @@@ method: getRotation @@@
		prototype.getRotation = function ()
		{

			// check if cached value exists
			if (this.cached.rotation)
			{ return this.cached.rotation; }

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
					x += (n_finger.screenX - i_finger.screenX);
					y += (n_finger.screenY - i_finger.screenY);

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

			// check if cached value exists
			if (this.cached.distance)
			{ return this.cached.distance; }

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
					x += Math.abs(n_finger.screenX - i_finger.screenX);
					y += Math.abs(n_finger.screenY - i_finger.screenY);

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

	})(OCBNET.Gestures.prototype);
	// @@@ EO Class declaration @@@




	// @@@ jQuery fn: gesture @@@
	jQuery.fn.gesture = function (handlers)
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
				gesture = new OCBNET.Gestures(el);

				// store the object on the element
				jQuery(el).data('gesture', gesture);

			}
			// EO if gesture not initialised

			// extend the gesture handlers object
			// maybe change them to event handlers
			jQuery.extend(gesture.handlers, handlers);

		});
		// EO each element

	}
	// @@@ EO jQuery fn: gesture @@@

























})(jQuery);
// EO private scope