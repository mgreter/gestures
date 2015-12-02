/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	if (
		// proper detection for ie10+ on desktop (https://github.com/CreateJS/EaselJS/issues/273)
		// this will also be true for ie11 and hopefully for all future IE generations (I dare you MS)
		(!window.navigator['msPointerEnabled'] || !window.navigator["msMaxTouchPoints"]) //ie10
		&& (!window.navigator['pointerEnabled'] || !window.navigator["maxTouchPoints"]) //ie11
	) return;

	// event names may vary
	// ie 10 uses vendor prefix
	// keep the legacy code here
	var evt_name = {
		'up' : 'MSPointerUp',
		'move' : 'MSPointerMove',
		'down' : 'MSPointerDown',
		'cancel' : 'MSPointerCancel',
		// name for css attributes
		'action' : 'ms-touch-action'
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
			'down' : 'pointerdown',
			'cancel' : 'pointercancel',
			// name for css attributes
			'action' : 'touch-action'
		};
	}

	// @@@ private fn: handlePointerDown @@@
	// this is invoked on the most inner node
	// the `this` context points to the gesture
	function handlePointerDown (evt)
	{

		// get variables from event
		var el = evt.currentTarget,
		    org = evt.originalEvent;

		// get the gesture for current element
		// it should be here, otherwise I don't know
		// why I would be registered on this element
		var gesture = jQuery(el).data('gesture');

		// assertion for same object (play safe - dev)
		if (gesture !== this) eval("alert('assertion')");

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

		// prevent some mouse events
		// hopefully doesnt bite back
		var config = gesture.config;
		if (!config.hatchPointerDown)
		{ evt.preventDefault(); }

	}
	// @@@ EO private fn: handlePointerDown @@@


	// @@@ private fn: handlePointerMove @@@
	// this is invoked on the document node
	// the `this` context points to document
	function handlePointerMove (evt)
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

	}
	// @@@ EO private fn: handlePointerMove @@@


	// @@@ private fn: handlePointerUp @@@
	// this is invoked on the document node
	// the `this` context points to document
	function handlePointerUp (evt)
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
		});

		// only release the specific button
		OCBNET.Gestures.fingerup(event);

	}
	// @@@ EO private fn: handlePointerUp @@@


	// extend class
	(function(prototype)
	{

		// bind additional events for gestures
		prototype.init.push(function (el)
		{

			// by default we call preventDefault on
			// pointerDown event. This should prevent
			// unwanted emulated mouse down/click event
			// disable this via hatchPointerDown option
			/*
			this.config = jQuery.extend({
				// disabled (false) by default
				// you may enable "pass-through"
				hatchPointerDown: false
			}, this.config);
			*/

			// create a closure
			var closure = this;

			// native actions
			var actions = [];

			// get object with info about which
			// actions should be handled by UA
			var action = this.config.native || {};

			// push native features to array
			if (action.panY) actions.push('pan-y');
			if (action.panX) actions.push('pan-x');
			// add default value if we have no option yet
			if (actions.length == 0) actions.push('none');

			// create proxy function to keep this context
			var proxy = jQuery.proxy(handlePointerDown, this);
			// trap pointerdown locally on each element
			jQuery(el).bind(evt_name['down'], proxy)
			// this can ie. cancel pointers on scroll
			// mostly we will only see pan-x/pan-y here
			.css(evt_name['action'], actions.join(' '))

		});
		// EO bind additional events for gestures

	})(OCBNET.Gestures.prototype);
	// EO extend class


	// use same handler for pointerup and pointercancel
	var evt_up = [evt_name['up'], evt_name['cancel']].join(' ');

	// trap pointerup globally, "trap" for all cases
	// canceled ie. if user decided to scroll not swipe
	jQuery(document).bind(evt_up, handlePointerUp)
	// EO MSPointerUp

	// trap pointermove globally, "trap" for all cases
	// this will be called for every pointer that moved
	jQuery(document).bind(evt_name['move'], handlePointerMove)
	// EO MSPointerMove


})(jQuery);
// EO private scope
