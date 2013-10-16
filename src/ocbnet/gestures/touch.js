/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	if ( 'msPointerEnabled' in window.navigator ) return;

	(function(prototype)
	{

		var handler = prototype.handler;

		// @@@ private fn: handleTouchDownEvent @@@
		handler['touchstart'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget;

			// get touch event options
			var org = evt.originalEvent,
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
					screenX : touch.screenX,
					screenY : touch.screenY,
					timeStamp : evt.timeStamp
				};

				// create a fingerdown event object
				var event = new jQuery.Event('fingerdown', {

					finger: finger,
					originalEvent: evt

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
		handler['touchend'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget;

			// get touch event options
			var org = evt.originalEvent,
			    changed = org.changedTouches || [];

			// process all newly added fingers
			jQuery(changed).each(function (i, touch)
			{

				// create the finger object
				// copy some data from event
				var finger = {
					id : touch.identifier,
					type : evt.type,
					screenX : touch.screenX,
					screenY : touch.screenY,
					timeStamp : evt.timeStamp
				};

				// create a fingerdown event object
				var event = new jQuery.Event('fingerup', {

					finger: finger,
					originalEvent: evt

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
		handler['touchmove'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget;

			// get the gesture data from element
			var gesture = jQuery(el).data('gesture');

			// get touch event options
			var org = evt.originalEvent,
			    changed = org.changedTouches || [];

			// create new fingers objects
			// this is stored as move data
			var fingers = []

			// process all newly added fingers
			jQuery(changed).each(function (i, touch)
			{

				// create new fingers objects
				// this is stored as move data
				var finger = {
					el : el,
					id : touch.identifier,
					type : evt.type,
					screenX : touch.screenX,
					screenY : touch.screenY,
					timeStamp : evt.timeStamp
				};

				// create a fingerdown event object
				var event = new jQuery.Event('fingermove', {

					finger: finger,
					originalEvent: evt

				})

				// emmit this event on the element
				// this will bubble up to propably
				// more gesture handlers, use setup
				// to decide on each gesture if you
				// would like to use that finger
				jQuery(el).trigger(event)

			});
			// EO all changed fingers

			// dispatch normalized data
			// gesture.fingersMove(fingers, evt);

		}
		// @@@ EO private fn: handleTouchMoveEvent @@@




		handler['touchcancel'] = handler['touchend'];

		prototype.init.push(function (el)
		{

			var handle = jQuery.proxy(this.handle, this),
			    events = ['start', 'move', 'end', 'cancel'];

			for (var i in events)
			{
				var event = events[i];
				// bind ...
				jQuery(el)
					// ... to the touch events
					.bind('touch' + event, handle)
					.bind('traptouch' + event, handle);
				// taken from sources from the internet
				// if( window.navigator.msPointerEnabled )
				// { jQuery(el).css('msTouchAction', 'pan-y'); }
			}
		});

	})(OCBNET.Gestures.prototype);


})(jQuery);
// EO private scope
