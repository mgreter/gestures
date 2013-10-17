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

	// now register common event types to trap
	jQuery.event.special['mouseup'] = special;
	jQuery.event.special['mouseout'] = special;
	jQuery.event.special['mouseover'] = special;
	jQuery.event.special['mousemove'] = special;
	jQuery.event.special['mousedown'] = special;
	jQuery.event.special['touchend'] = special;
	jQuery.event.special['touchmove'] = special;
	jQuery.event.special['touchstart'] = special;
	jQuery.event.special['touchcancel'] = special;


})()
// @@@ EO private scope @@@
