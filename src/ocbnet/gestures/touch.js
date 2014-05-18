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
						x : touch.clientX || touch.screenX,
						y : touch.clientY || touch.screenY,
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
					// tested only on android so far (from experience this should work on ipad too)
					// chrome change the bevahior recently (only firing one touch move after it decided)
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
				x : touch.clientX || touch.screenX,
				y : touch.clientY || touch.screenY,
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
				x : touch.clientX || touch.screenX,
				y : touch.clientY || touch.screenY,
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
