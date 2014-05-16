/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// proper detection for ie10 on desktop (https://github.com/CreateJS/EaselJS/issues/273)
	// this will also be true for ie11 and hopefully for all future IE generations (I dare you MS)
	if ( ! (window.navigator['msPointerEnabled'] && window.navigator["msMaxTouchPoints"] > 0) ) return;

	// event names may vary
	// ie 10 uses vendor prefix
	// keep the legacy code here
	var evt_name = {
		'up' : 'MSPointerUp',
		'move' : 'MSPointerMove',
		'down' : 'MSPointerDown'
	};

	// https://coderwall.com/p/mfreca
	// so feature detection is the way to go, the internet says
	// thank you IE for once again keeping things "interesting"
	if (
		window.navigator['pointerEnabled'] &&
		window.navigator["maxTouchPoints"] > 0
	) {
		// use new names
		evt_name = {
			'up' : 'pointerup',
			'move' : 'pointermove',
			'down' : 'pointerdown'
		};
	}

	// extend class
	(function(prototype)
	{

		// bind additional events for gestures
		prototype.init.push(function (el)
		{

			// create a closure
			var closure = this;

			// trap mousedown locally on each element
			jQuery(el).bind(evt_name['down'], function (evt)
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
	jQuery(document).bind(evt_name['up'], function (evt)
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
	jQuery(document).bind(evt_name['move'], function (evt)
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
