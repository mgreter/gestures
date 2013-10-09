/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// @@@ private fn: handleTouchDownEvent @@@
	function handleTouchDownEvent (evt)
	{

		// get variables from the event object
		var el = evt.currentTarget;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// process all newly added fingers
		jQuery(changed).each(function (i, touch)
		{

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


	// @@@ private fn: handleTouchEndEvent @@@
	function handleTouchEndEvent (evt)
	{

		// get variables from the event object
		var el = evt.currentTarget;

		// get touch event options
		var org = evt.originalEvent,
		    touches = org.touches || [],
		    changed = org.changedTouches || [];

		// process all newly added fingers
		jQuery(changed).each(function (i, touch)
		{

			// create the finger object
			// copy some data from event
			var finger = {
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
		var el = evt.currentTarget;

		// get the gesture data from element
		var hand = jQuery(el).data('hand');
		var gestures = jQuery(el).data('gestures');

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
		gestures.fingersMove(changes, evt);

	}
	// @@@ EO private fn: handleTouchMoveEvent @@@

	OCBNET.Gestures.prototype.handler['touchend'] = handleTouchEndEvent;
	OCBNET.Gestures.prototype.handler['touchcancel'] = handleTouchEndEvent;
	OCBNET.Gestures.prototype.handler['touchstart'] = handleTouchDownEvent;
	OCBNET.Gestures.prototype.handler['touchmove'] = handleTouchMoveEvent;

	OCBNET.Gestures.prototype.init.push(function (el)
	{
		// bind ...
		jQuery(el)
			// ... to the touch events
			.bind('touchend', jQuery.proxy(this.handle, this))
			.bind('touchmove', jQuery.proxy(this.handle, this))
			.bind('touchstart', jQuery.proxy(this.handle, this))
			.bind('touchcancel', jQuery.proxy(this.handle, this))
			.bind('traptouchend', jQuery.proxy(this.handle, this))
			.bind('traptouchmove', jQuery.proxy(this.handle, this))
			.bind('traptouchstart', jQuery.proxy(this.handle, this))
			.bind('traptouchcancel', jQuery.proxy(this.handle, this))
	});

})(jQuery);
// EO private scope
