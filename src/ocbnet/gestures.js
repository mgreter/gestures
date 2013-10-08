/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

// make sure our global namespace exists
// but do not reset it if already present
if (typeof OCBNET == 'undefined') var OCBNET = {};

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	var down = 0;

	// store all hand down at any time
	// used to store some static information
	// each finger can be involved in multiple
	// gestures and it makes it possible to get
	// the associated finger data only with the id
	var onsurface = {};

	// store all elements that have some gesture attached
	// needed only to dispatch mousemove events to all nodes
	var elements = [];

	// in how many angle sectors should swipes be allowed
	var swipeSectors = 2, swipeMinDistance = 20;

	// check if ontouchstart is supported
	// taken directly from hammer.js library
	var touchdevice = ('ontouchstart' in window);

	// define the event to listen to on this device
	var stopEvent = touchdevice ? 'touchend' : 'mouseup';
	var moveEvent = touchdevice ? 'touchmove' : 'mousemove';
	var startEvent = touchdevice ? 'touchstart' : 'mousedown';

// **** alpha code below
// **** alpha code below
// **** alpha code below
// **** alpha code below

/*
	var outside = true;
	jQuery(function()
	{
		jQuery(window).bind('mouseenter', function() { outside = false; });
		jQuery(window).bind('mouseleave', function() { outside = true; });
	});
*/

	// @@@ private fn: handleFingerUpEvent @@@
	function fixIeMouseButtonWhich (evt)
	{

		// check for ie condition with wrong which
		// check from accumulated buttons and already
		// known down buttons which button is really new
		if (evt.button && ! evt.originalEvent.which)
		{
			if (evt.button & 1 && !onsurface[1]) { evt.which = 1; }
			else if (evt.button & 4 && !onsurface[2]) { evt.which = 2; }
			else if (evt.button & 2 && !onsurface[3]) { evt.which = 3; }
		}

	}
	// @@@ EO private fn: fixIeMouseButtonWhich @@@


	// @@@ private fn: handleFingerUpEvent @@@
	function handleFingerUpEvent (evt)
	{

		// get local variables
		var el = jQuery(evt.currentTarget),
		    hand = el.data('hand'),
		    finger = evt.finger,
		    gesture = hand.gesture;

		// get index of finger in current gesture
		var idx = jQuery.inArray(finger.id, hand.order)

		// finger was used
		if (idx != -1)
		{

			// call the stop function on hand
			if (jQuery.isFunction(gesture.stop))
			{ gesture.stop.call(hand, finger, evt); }

			// calculate status of this gesture
			hand.stop = {
				center : hand.getCenter(),
				rotation : hand.getRotation(),
				distance : hand.getDistance()
			}

			// calculate status of this gesture
			hand.center = hand.stop.center;
			hand.rotation = hand.stop.rotation;
			hand.distance = hand.stop.distance;

			// stop swipe movement
			delete hand.swipeSector;

			// decrease hand count
			hand.count --;

			// remove finger from order array
			hand.order.splice(idx, 1);

			// remove the finger from the hand
			delete hand.finger[finger.id];

			// remove finger from surface
			delete onsurface[finger.id];

		}
		// EO if used

	}
	// @@@ EO private fn: handleFingerUpEvent @@@


	// @@@ private fn: handleFingerDownEvent @@@
	function handleFingerDownEvent (evt)
	{

		// get local variables
		var el = jQuery(evt.currentTarget),
		    finger = evt.finger,
		    hand = el.data('hand'),
		    gesture = hand.gesture;

		// check if the finger should be taken for this gesture
		if (
			jQuery.isFunction(gesture.start)
				? gesture.start.call(hand, evt, finger)
				: gesture.start
		)
		{

			// get index of finger in current gesture
			var idx = jQuery.inArray(finger.id, hand.order);

			// finger was not used
			if (idx == -1)
			{

				// increase hand count
				hand.count ++;

				// reset static data
				hand.static = {};

				// add this finger to the end
				hand.order.push(finger.id);

				// attach this finger to the hand
				hand.finger[finger.id] = finger;

				// store data closure object for finger
				hand.data[finger.id] = finger.data;

				// add finger to surface
				onsurface[finger.id] = finger;

				// calculate status of this gesture
				hand.start = {
					center : hand.getCenter(),
					rotation : hand.getRotation(),
					distance : hand.getDistance()
				}

				// create and init a copy for move
				hand.move = jQuery.extend({}, hand.start);

			}
			// EO if not used

		}
		// EO if finger taken

	}
	// @@@ EO private fn: handleFingerDownEvent @@@


// **** alpha code above
// **** alpha code above
// **** alpha code above
// **** alpha code above


	// @@@ private fn: handleTouchEndEvent @@@
	function handleTouchEndEvent (evt)
	{

		// get variables from the event object
		var id = evt.which, el = evt.currentTarget;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// process all newly added fingers
		jQuery(changed).each(function (i, touch)
		{

			var id = touch.identifier;

			// create the finger object
			// copy some data from event
			var finger = {
				id : id,
				type : evt.type,
				pageX : touch.pageX,
				pageY : touch.pageY,
				clientX : touch.clientX,
				clientY : touch.clientY,
				screenX : touch.screenX,
				screenY : touch.screenY,
				timeStamp : evt.timeStamp,
				originalEvent : evt.originalEvent
			};

			// create a fingerdown event object
			var event = new jQuery.Event('fingerup', {

				finger: finger

			})

			// emmit this event on the element
			// this will bubble up to propably
			// more gesture handlers, use setup
			// to decide on each gesture if you
			// would like to use that finger
			jQuery(el).trigger(event)

		})

	}
	// @@@ EO private fn: handleTouchEndEvent @@@

	// @@@ private fn: handleTouchMoveEvent @@@
	function handleTouchMoveEvent (evt)
	{

		// get variables from the event object
		var id = evt.which, el = evt.currentTarget;

		// get the gesture data from element
		var hand = jQuery(el).data('hand');

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// create new fingers objects
		// this is stored as move data
		var changes = []

		// process all newly added fingers
		jQuery(changed).each(function (i, touch)
		{

			// create new fingers objects
			// this is stored as move data
			changes.push({
				el : el,
				id : touch.identifier,
				type : evt.type,
				pageX : touch.pageX,
				pageY : touch.pageY,
				clientX : touch.clientX,
				clientY : touch.clientY,
				screenX : touch.screenX,
				screenY : touch.screenY,
				timeStamp : evt.timeStamp,
				originalEvent : evt.originalEvent
			});

		});
		// EO all changed fingers

		// dispatch normalized data
		doFingersMoveEvent (changes, evt)

	}
	// @@@ EO private fn: handleTouchMoveEvent @@@


	// @@@ private fn: doFingersMoveEvent @@@
	function doFingersMoveEvent (changes, evt)
	{

		// process all registered elements
		var e = elements.length; while (e--)
		{

			// collect local changes
			var localchanges = [];

			// get the gesture data from local element
			var hand = elements[e].data('hand'),
			    gesture = hand.gesture;

			// check all fingers on the hand for changes
			for (var localid in hand.finger)
			{
				// process all changes on current move
				var l = changes.length; while (l--)
				{
					// use changed finger if on hand
					if (changes[l].id == localid)
					{ localchanges.push(changes[l]); }
				}
			}
			// EO check fingers on hand

			// check if this hand has changes
			if (localchanges.length)
			{

				// update the changed fingers on hand
				var i = localchanges.length; while (i--)
				{
					var finger = localchanges[i];
					hand.finger[finger.id] = finger;
				}

				hand.move = {
					center : hand.getCenter(),
					rotation : hand.getRotation(),
					distance : hand.getDistance()
				}

				// calculate status of this gesture
				hand.center = hand.move.center;
				hand.rotation = hand.move.rotation;
				hand.distance = hand.move.distance;

				// detect swipes to dispatch by center offsets
				var mx = hand.move.center.x,
				    my = hand.move.center.y,
				    sx = hand.start.center.x,
				    sy = hand.start.center.y,
				    deltaX = Math.abs(mx - sx),
				    deltaY = Math.abs(my - sy);

				// call the move function on the gesture object
				if (jQuery.isFunction(gesture.move))
				{ gesture.move.call(hand, localchanges, evt); }

				// check if there is a swipe handler
				if (jQuery.isFunction(gesture.swipe))
				{

					// check if there is a swipe movement
					if (typeof hand.swipeSector == 'undefined')
					{
						// check if we have the minimum move distance reached for a swipe
						if (Math.sqrt(deltaX*deltaX + deltaY*deltaY) > swipeMinDistance)
						{
							// determine in which sector the swipe was
							// get the rotation of the swipe to match to sector
							var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
							hand.swipeSector = parseInt(angle / 90 * swipeSectors, 10);
							hand.swipeSector = Math.min(hand.swipeSector, swipeSectors - 1);
						}
					}
					// EO if no swipe yet

					// check if swipe has been started
					// always keep swipe in same sector
					if (typeof hand.swipeSector != 'undefined')
					{
						// call the move function on the gesture object
						gesture.swipe.call(hand, hand.swipeSector, localchanges, evt);
					}
					// EO if swiping

				}
				// EO if swipe handler

				// call the transform function on the gesture object
				if (jQuery.isFunction(gesture.transform))
				{ gesture.transform.call(hand, localchanges, evt); }

			}
			// check for local changes

		}
		// EO process all elements

	}
	// @@@ EO private fn: doFingersMoveEvent @@@


	// @@@ private fn: handleTouchDownEvent @@@
	function handleTouchDownEvent (evt)
	{

		// get variables from the event object
		var id = evt.which, el = evt.currentTarget;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// process all newly added fingers
		jQuery(changed).each(function (i, touch)
		{

			var id = touch.identifier;

			// create the finger object
			// copy some data from event
			var finger = {
				el: el,
				id : touch.identifier,
				type : evt.type,
				pageX : touch.pageX,
				pageY : touch.pageY,
				clientX : touch.clientX,
				clientY : touch.clientY,
				screenX : touch.screenX,
				screenY : touch.screenY,
				timeStamp : evt.timeStamp,
				originalEvent : evt.originalEvent
			};

			// create a fingerdown event object
			var event = new jQuery.Event('fingerdown', {

				finger: finger

			})

			// emmit this event on the element
			// this will bubble up to propably
			// more gesture handlers, use setup
			// to decide on each gesture if you
			// would like to use that finger
			jQuery(el).trigger(event)

		})

	}
	// @@@ EO private fn: handleTouchDownEvent @@@

	// @@@ private fn: handleMouseWheelEvent @@@
	function handleMouseWheelEvent (evt, delta, deltaX, deltaY)
	{

		// process all registered elements
		var e = elements.length; while (e--)
		{

			// get the gesture data from local element
			var hand = elements[e].data('hand'),
			    gesture = hand.gesture;

			// check if some finger is down
			// could also check for move data
			if (!hand.count) continue;

			// init static data
			if (!hand.static.rotation)
			{ hand.static.rotation = 0; }
			if (!hand.static.distance)
			{ hand.static.distance = 0; }

			// calculate status of this gesture
			hand.static.rotation += deltaX * 3;
			hand.static.distance += deltaY * 5;

			// calculate status of this gesture
			hand.move = {
				center : hand.getCenter(),
				rotation : hand.getRotation(),
				distance : hand.getDistance()
			}

			// calculate status of this gesture
			hand.center = hand.move.center;
			hand.rotation = hand.move.rotation;
			hand.distance = hand.move.distance;

			// call the move function on the gesture object
			if (jQuery.isFunction(gesture.transform))
			{ gesture.transform.call(hand, hand.finger, evt); }

		}
		// EO process all elements

	}
	// @@@ EO private fn: handleMouseWheelEvent @@@

	// @@@ private fn: handleMouseMoveEvent @@@
	function handleMouseMoveEvent (evt)
	{

		// get variables from the event object
		var id = evt.which, el = evt.data.el;

		// get the gesture data from element
		var hand = jQuery(el).data('hand');

		// create new fingers objects
		// this is stored as move data
		var changes = [];

		// change was for all fingers
		// but for all on the whole surface
		for (var id in onsurface)
		{

			changes.push({
				el : el,
				id : id,
				type : evt.type,
				pageX : evt.pageX,
				pageY : evt.pageY,
				clientX : evt.clientX,
				clientY : evt.clientY,
				screenX : evt.screenX,
				screenY : evt.screenY,
				timeStamp : evt.timeStamp,
				originalEvent : evt.originalEvent
			});

		}
		// EO each finger

		// dispatch normalized data
		doFingersMoveEvent (changes, evt);

	}
	// @@@ EO private fn: handleMouseMoveEvent @@@

	// @@@ private fn: handleMouseDownEvent @@@
	function handleMouseDownEvent (evt)
	{

		// get variables from the event object
		var id = evt.which, el = evt.currentTarget;

		// get the gesture data from element
		var hand = jQuery(el).data('hand');

		// prevent default action, otherwise
		// we would not receive mouse up events
		if (evt.button != 0) evt.preventDefault();

		// create a closure handler to make it uniquely unbindable
		// maybe there is a better way which is not that hard to bind only once
		var handler = function (evt)
		{

			// only handle mouse up if
			// id is the same as for down
			if(
				parseInt(id) === parseInt(evt.which)
				// this might not be needed anymore
				// || evt.target === document
				// || evt.target === document.documentElement
			)
			{
				// call hand event handler
				// this event will not be taken by
				// any other bubbled gesture handler
				handleHandEvents.apply(this, arguments);
			}
		}

		var mover = function (evt)
		{
			// call hand event handler
			// this event will not be taken by
			// any other bubbled gesture handler
			handleHandEvents.apply(this, arguments);
		}

		// create closure data for event binding
		var data = { el: el, id : id, handler: handler, mover: mover };

		// create new finger object
		// this is stored as start data
		var finger =
		{
			el : el,
			id : evt.which,
			type : evt.type,
			pageX : evt.pageX,
			pageY : evt.pageY,
			clientX : evt.clientX,
			clientY : evt.clientY,
			screenX : evt.screenX,
			screenY : evt.screenY,
			timeStamp : evt.timeStamp,
			originalEvent : evt.originalEvent
		}

		// create a fingerdown event object
		var event = new jQuery.Event('fingerdown', {

			finger: finger

		})

		// check if this finger is not yet known
		// this means the finger went down twice
		if (jQuery.inArray(finger.id, hand.order) == -1)
		{

			// bind event handlers to release button
			jQuery(el).bind('mouseup', data, handler);
			jQuery(el).bind('mousemove', data, mover);
			jQuery(el).bind('mousewheel', data, handler);
			jQuery(el).bind('trapmouseup', data, handler);
			jQuery(el).bind('trapmousemove', data, mover);
			jQuery(el).bind('trapmousewheel', data, handler);


			// bind on document to fetch mouseup not on target
			jQuery(document).bind('mouseup', data, handler);
			jQuery(document).bind('mousemove', data, mover);
			jQuery(document).bind('mousewheel', data, handler);
			jQuery(document).bind('trapmouseup', data, handler);
			jQuery(document).bind('trapmousemove', data, mover);
			jQuery(document).bind('trapmousewheel', data, handler);

 			// do not enable this, strange bug in IE
 			// investigate why target stays the same
 			// if(el.setCapture) { el.setCapture(); }

		}

		// increase down counters
		// down ++; hand.down ++;

		// emmit this event on the element
		// this will bubble up to propably
		// more gesture handlers, use setup
		// to decide on each gesture if you
		// would like to use that finger
		jQuery(el).trigger(event)

	}
	// @@@ EO private fn: handleMouseDownEvent @@@


	// @@@ private fn: handleMouseUpEvent @@@
	function handleMouseUpEvent (evt)
	{

		var ids = {}

		ids[evt.which] = evt.data;

		if (
			evt.clientX < 0 || evt.clientY < 0 ||
			evt.clientX > jQuery(window).width() ||
			evt.clientY > jQuery(window).height()
		)
		{

			// process all registered elements
			var e = elements.length; while (e--)
			{
				// get the gesture data from local element
				var hand = elements[e].data('hand')
				// add all fingers that are down to be released
				for (var id in hand.finger) ids[parseFloat(id)] = {

					el: elements[e]

				};
			}
		}

		for (var id in ids)
		{

			// get variables from the event object
			var data = ids[id],
			    el = data.el,
			    mover = data.mover,
			    handler = data.handler;

			// get the gesture data from element
			var hand = jQuery(el).data('hand');

			// create new finger object
			// this is stored as stop data
			var finger =
			{
				el : el,
				id : parseInt(id),
				type : evt.type,
				pageX : evt.pageX,
				pageY : evt.pageY,
				clientX : evt.clientX,
				clientY : evt.clientY,
				screenX : evt.screenX,
				screenY : evt.screenY,
				timeStamp : evt.timeStamp,
				originalEvent : evt.originalEvent
			}

			// create a fingerdown event object
			var event = new jQuery.Event('fingerup', {

				finger: finger

			})

			// emmit this event on the element
			// this will bubble up to propably
			// more gesture handlers, use setup
			// to decide on each gesture if you
			// would like to use that finger
			jQuery(el).trigger(event)

			// decrease down counters
			// down --; hand.down --;

			// do not enable this, strange bug in IE
			// investigate why target stays the same
			// if(el.releaseCapture) { el.releaseCapture(); }

			// bind event handlers to release button
			jQuery(el).unbind('mouseup', handler);
			jQuery(el).unbind('mousemove', mover);
			jQuery(el).unbind('mousewheel', handler);
			jQuery(el).unbind('trapmouseup', handler);
			jQuery(el).unbind('trapmousemove', mover);
			jQuery(el).unbind('trapmousewheel', handler);

			// bind on document to fetch mouseup not on target
			jQuery(document).unbind('mouseup', handler);
			jQuery(document).unbind('mousemove', mover);
			jQuery(document).unbind('mousewheel', handler);
			jQuery(document).unbind('trapmouseup', handler);
			jQuery(document).unbind('trapmousemove', mover);
			jQuery(document).unbind('trapmousewheel', handler);

		}

	}
	// @@@ EO private fn: handleMouseUpEvent @@@


	// @@@ private fn: handleHandEvents @@@
	// these events will still bubble up the dom
	// but will not be taken twice by a gesture
	// we will emmit our own events and they should
	// only be emmited once on the top most gesture
	function handleHandEvents (evt)
	{

		// get variables
		var handler, id = evt.which,
				original = evt.originalEvent;

		// check if this event has already
		// been handled by this hand handler
		// IE 7 only preserves strings for data
		if (!original.data)
		{

			// remember that we already consumed
			// this event to emit gesture events
			original.data = true;

			// give a debug message about the consumed gesture event
			// console.log('handleHandEvents', evt.type, evt.which, evt.currentTarget.id, evt.target.id);

			// handle all events
			switch (evt.type)
			{

				case 'mouseup':
				case 'trapmouseup':
					// fixIeMouseButtonWhich(evt);
					handler = handleMouseUpEvent;
				break;
				case 'mousemove':
				case 'trapmousemove':
					// fixIeMouseButtonWhich(evt);
					handler = handleMouseMoveEvent;
				break;
				case 'mousedown':
				case 'trapmousedown':
					fixIeMouseButtonWhich(evt);
					handler = handleMouseDownEvent;
				break;

				case 'touchend':
				case 'touchcancel':
				case 'traptouchend':
				case 'traptouchcancel':
					handler = handleTouchEndEvent;
				break;
				case 'touchstart':
				case 'traptouchstart':
					handler = handleTouchDownEvent;
				break;
				case 'touchmove':
				case 'traptouchmove':
					handler = handleTouchMoveEvent;
				break;

				case 'mouseout':
					handler = handleMouseOutEvent;
				break;
				case 'mousewheel':
					handler = handleMouseWheelEvent;
				break;

			}
			// EO switch type

			// call the specific handler
			// error for unknown event type
			// don't register me for for those
			handler.apply(this, arguments)

		}
		// EO if already consumed

	}
	// @@@ EO private fn: handleHandEvents @@@

	// @@@ private fn: setupHand @@@
	function setupHand (el)
	{

		// jQueryfy element
		el = jQuery(el);

		// get the gesture data from element
		var hand = el.data('hand');

		// check if data exists
		if (!hand)
		{

			// add element to array
			elements.push(el);

			// otherwise setup inital data
			el.data('hand', hand =
			{

				down: 0,
				count: 0,

				taps: [],
				order: [],
				static: {},
				holder: {},
				tapper: {},
				data: {},
				finger: {},
				gesture: {},
				config: {
					tap: true,
					hold: true,
					finger: true,
					hand: true
				},
				getCenter: function ()
				{

					if (this.static.center)
					{ return this.static.center; }

					// create center object
					var center = {};

					// init variables to calculate the center point of all fingers
					var attrs = ['page', 'client', 'screen'], axes = ['X', 'Y'];

					// sum up all attributes
					for (var localid in this.finger)
					{
						// get finger from this gesture
						var finger = this.finger[localid];
						// process all attribs and axes
						var n = attrs.length; while (n--)
						{
							var i = axes.length; while (i--)
							{
								// combine attribute string
								var attr = attrs[n] + axes[i];
								// initialize attribute on center object
								if (!center[attr]) { center[attr] = 0; }
								// add the current point and divide by count
								center[attr] += finger[attr] / this.count;
							}
							// EO each axis
						}
						// EO each attribute
					}
					// EO each finger

					// normalize x/y value
					center.x = center.screenX;
					center.y = center.screenY;

					// return center
					return center;

				},

				getRotation : function ()
				{

					if (this.static.rotation)
					{ return this.static.rotation; }

					if (this.count < 2) return 0;

					var x = 0, y = 0, c = 0, msg = "";

					for (var i = 0, l = this.order.length; i < l; i++)
					{

						var i_id = this.order[i],
						    i_finger = this.finger[i_id];

						for (var n = i + 1; n < l; n++)
						{

							c ++;

							var n_id = this.order[n],
							    n_finger = this.finger[n_id];

							x += (n_finger.screenX - i_finger.screenX);
							y += (n_finger.screenY - i_finger.screenY);

						}
					}

					x /= c; y /= c;

					return Math.atan2(y, x) * 180 / Math.PI;

				},

				getDistance : function ()
				{

					if (this.static.distance)
					{ return this.static.distance; }

					if (this.count < 2) return 0;

					var x = 0, y = 0, c = 0, msg = "";

					for (var i = 0, l = this.order.length; i < l; i++)
					{

						var i_id = this.order[i],
						    i_finger = this.finger[i_id];

						for (var n = i + 1; n < l; n++)
						{

							c ++;

							var n_id = this.order[n],
							    n_finger = this.finger[n_id];

							x += Math.abs(n_finger.screenX - i_finger.screenX);
							y += Math.abs(n_finger.screenY - i_finger.screenY);

						}
					}

					x /= c; y /= c;

					return Math.sqrt(x*x + y*y);

				},

				el: el

			})
			// EO initial hand data

			// attach to start event for the given device
			// do not use both events at the same time as touch
			// devices may interfere by emulating mouse events
			.bind(startEvent, handleHandEvents)
			.bind('trap' + startEvent, handleHandEvents)

			// bind to our custom finger events
			.bind('fingerup', el, handleFingerUpEvent)
			.bind('fingerdown', el, handleFingerDownEvent)

			// do not allow dragging of any gesture elements
			.bind('dragstart', function () { return false; })

			.bind('touchend', handleHandEvents)
			.bind('touchmove', handleHandEvents)
			.bind('touchcancel', handleHandEvents)
			.bind('traptouchend', handleHandEvents)
			.bind('traptouchmove', handleHandEvents)
			.bind('traptouchcancel', handleHandEvents)

		}
		// EO if hand not exists

		// return data
		return hand;

	}
	// @@@ private fn: setupHand @@@


	// @@@ jQuery fn: gesture @@@
	jQuery.fn.gesture = function (gesture)
	{

		// process all elements in collection
		jQuery(this).each(function (i, el)
		{

			// get/create the gesture data
			var hand = setupHand(el);

			// extend the gesture data
			jQuery.extend(hand.gesture, gesture);

		});
		// EO each element

	}
	// @@@ EO jQuery fn: gesture @@@


})(jQuery);
// EO private scope