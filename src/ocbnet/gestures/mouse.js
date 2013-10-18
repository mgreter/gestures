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
// EO private scope