/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	var els = {};

	if ( ! 'msPointerEnabled' in window.navigator ) return;

	(function(prototype)
	{

		var handler = prototype.handler;

		// @@@ private fn: handleTouchDownEvent @@@
		handler['MSPointerDown'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget,
			    org = evt.originalEvent;

console.logall(org.pointerId, " - ", evt.which);

			// create the finger object
			// copy some data from event
			var finger = {
				el: el,
				type : evt.type,
				id : org.pointerId,
				originalEvent : evt,
				screenX : org.pageX,
				screenY : org.pageY,
				timeStamp : evt.timeStamp
			};

			els[finger.id] = el;

			console.log('DOWN', finger.id, el.id);

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

		}
		// @@@ EO private fn: handleTouchDownEvent @@@


		// @@@ private fn: handleTouchEndEvent @@@
		handler['MSPointerUp'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget,
			    org = evt.originalEvent;

			el = els[org.pointerId];

 if (!el) return;

			// create the finger object
			// copy some data from event
			var finger = {
				el: el,
				type : evt.type,
				id : org.pointerId,
				originalEvent : evt,
				screenX : org.pageX,
				screenY : org.pageY,
				timeStamp : evt.timeStamp
			};
console.log('UP', finger.id, el.id);
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

delete els[finger.id];

		}
		// @@@ EO private fn: handleTouchEndEvent @@@

		// @@@ private fn: handleTouchMoveEvent @@@
		handler['MSPointerMove'] = function (evt)
		{

			// get variables from the event object
			var el = evt.currentTarget,
			    org = evt.originalEvent;

			el = els[org.pointerId];

			// get the gesture data from element
			var gesture = jQuery(el).data('gesture');

			// create the finger object
			// copy some data from event
			var finger = {
				el: el,
				type : evt.type,
				id : org.pointerId,
				originalEvent : evt,
				screenX : org.pageX,
				screenY : org.pageY,
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

			// dispatch normalized data
			// gesture.fingersMove([finger], evt);

		}
		// @@@ EO private fn: handleTouchMoveEvent @@@


//		handler['touchcancel'] = handler['touchend'];

		prototype.init.push(function (el)
		{

			var handle = jQuery.proxy(this.handle, this);

			// bind to the pointer event
			jQuery(el).bind('MSPointerDown', handle);
			// taken from sources from the internet
			if( window.navigator.msPointerEnabled )
			{ jQuery(el).css('msTouchAction', 'none'); }

			// bind global ...
			jQuery(document)
				// ... pointer events
				.bind('MSPointerUp', handle)
				.bind('MSPointerMove', handle);

		});

	})(OCBNET.Gestures.prototype);


})(jQuery);
// EO private scope
