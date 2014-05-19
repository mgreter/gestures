// @@@ private scope @@@
(function()
{


	// @@@ private fn: trap @@@
	function trap (handleObj)
	{

		// get current handler for event
		var handler = handleObj.handler;

		// @@@ closure fn: trapped @@@
		var trapped = function (evt)
		{

			// call the original handler first
			var rv = handler.call(this, evt);

			// check if event propagation was disabled
			if (rv == false || evt.isPropagationStopped())
			{

				// store some event attributes
				var type = evt.type,
				    isTrigger = evt.isTrigger,
				    isPropagationStopped = evt.isPropagationStopped,
				    isImmediatePropagationStopped = evt.isImmediatePropagationStopped;

				// add trap prefix to event
				// for custom event on target
				evt.type = 'trap' + evt.type;

				// force custom event propagating
				evt.isPropagationStopped = function () { return false; };
				evt.isImmediatePropagationStopped = function () { return false; }

				// this will bubble up so you can
				// handle that trapped event anyway
				// XXX: Maybe call on parent instead
				jQuery(evt.currentTarget).parent().trigger(evt);

				// restore some event attributes
				evt.type = type; evt.isTrigger = isTrigger;
				if (isPropagationStopped) evt.stopPropagation();
				if (isImmediatePropagationStopped) evt.stopImmediatePropagation();

				// return the same as original handler
				if (typeof rv != 'undefined') return rv;

			}
			// EO if not propagating

		}
		// @@@ EO closure fn: trapped @@@

		// reset given handler
		handleObj.handler = trapped;

	}
	// @@@ EO private fn: trap @@@


	// special event callback
	var special = { add : trap };

	// check for mouse interface
	if ( 'onmousedown' in window )
	{
		// register common event types to trap
		jQuery.event.special['mouseup'] = special;
		jQuery.event.special['mouseout'] = special;
		jQuery.event.special['mouseover'] = special;
		jQuery.event.special['mousemove'] = special;
		jQuery.event.special['mousedown'] = special;
	}

	// check for touch interface
	if ( 'ontouchstart' in window )
	{
		// register common event types to trap
		jQuery.event.special['touchend'] = special;
		jQuery.event.special['touchmove'] = special;
		jQuery.event.special['touchstart'] = special;
		jQuery.event.special['touchcancel'] = special;
	}

	// check if we have a pointer interface (ie11)
	if ( window.navigator['pointerEnabled'] && window.navigator["maxTouchPoints"] > 0 )
	{
		// register common event types to trap
		jQuery.event.special['pointerup'] = special;
		jQuery.event.special['pointermove'] = special;
		jQuery.event.special['pointerdown'] = special;
		jQuery.event.special['pointercancel'] = special;
	}
	// check if we have a pointer interface (ie10)
	else if ( window.navigator['msPointerEnabled'] && window.navigator["msMaxTouchPoints"] > 0 )
	{
		// register common event types to trap
		jQuery.event.special['MSPointerUp'] = special;
		jQuery.event.special['MSPointerMove'] = special;
		jQuery.event.special['MSPointerDown'] = special;
		jQuery.event.special['MSPointerCancel'] = special;
	}


})()
// @@@ EO private scope @@@
