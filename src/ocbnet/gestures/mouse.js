/*

  Copyright (c) Marcel Greter 2012 - OCBNET Gestures 0.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	(function(prototype)
	{

		var handler = prototype.handler;

		// check if ontouchstart is supported
		// taken directly from hammer.js library
		if (!('ontouchstart' in window))
		{

			// @@@ private fn: handleFingerUpEvent @@@
			function fixIeMouseButtonWhich (evt, surface)
			{

				// check for ie condition with wrong which
				// check from accumulated buttons and already
				// known down buttons which button is really new
				if (evt.button && ! evt.originalEvent.which)
				{
					if (evt.button & 1 && !surface[1]) { evt.which = 1; }
					else if (evt.button & 4 && !surface[2]) { evt.which = 2; }
					else if (evt.button & 2 && !surface[3]) { evt.which = 3; }
				}

			}
			// @@@ EO private fn: fixIeMouseButtonWhich @@@

			// @@@ private fn: handleMouseWheelEvent @@@
			handler['mousewheel'] = function (evt, delta, deltaX, deltaY)
			{

				// get variables from the event object
				var id = evt.which, el = evt.data.el;

				// get the gesture data from element
				var gesture = jQuery(el).data('gesture');

				var elements = gesture.elements;

				// process all registered elements
				var e = elements.length; while (e--)
				{

					// get the gesture data from local element
					var gesture = elements[e].data('gesture'),
					    handlers = gesture.handlers;

					// check if some finger is down
					// could also check for move data
					if (!gesture.fingers) continue;

					// init static data
					if (!gesture.cached.rotation)
					{ gesture.cached.rotation = 0; }
					if (!gesture.cached.distance)
					{ gesture.cached.distance = 0; }

					// calculate status of this gesture
					gesture.cached.rotation += deltaX * 3;
					gesture.cached.distance += deltaY * 5;

					// calculate status of this gesture
					gesture.move = {
						center : gesture.getCenter(),
						rotation : gesture.getRotation(),
						distance : gesture.getDistance()
					}

					// calculate status of this gesture
					gesture.center = gesture.move.center;
					gesture.rotation = gesture.move.rotation;
					gesture.distance = gesture.move.distance;

					// call the move function on the gesture object
					if (jQuery.isFunction(handlers.transform))
					{ handlers.transform.call(gesture, gesture.finger, evt); }

				}
				// EO process all elements

			}
			// @@@ EO private fn: handleMouseWheelEvent @@@

			// @@@ private fn: handleMouseMoveEvent @@@
			handler['mousemove'] = function (evt)
			{

				// get variables from the event object
				var id = evt.which, el = evt.data.el;

				// get the gesture data from element
				var gesture = jQuery(el).data('gesture');

				// create new fingers objects
				// this is stored as move data
				var fingers = [];

				// change was for all fingers
				// but for all on the whole surface
				for (var id in gesture.surface)
				{
					fingers.push({
						el : el,
						id : id,
						type : evt.type,
						// pageX : evt.pageX,
						// pageY : evt.pageY,
						// clientX : evt.clientX,
						// clientY : evt.clientY,
						screenX : evt.screenX,
						screenY : evt.screenY,
						timeStamp : evt.timeStamp,
						originalEvent : evt.originalEvent
					});
				}
				// EO each finger

				// dispatch normalized data
				gesture.fingersMove(fingers, evt);

			}
			// @@@ EO private fn: handleMouseMoveEvent @@@

			// @@@ private fn: handleMouseDownEvent @@@
			handler['mousedown'] = function (evt)
			{


				// get variables from the event object
				var id = evt.which, el = evt.currentTarget;

				// get the gesture data from element
				var gesture = jQuery(el).data('gesture');

				// call ie fix function for mouse buttons
				fixIeMouseButtonWhich(evt, gesture.surface);

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
						gesture.handle.apply(gesture, arguments)
					}
				}

				var mover = function (evt)
				{

					// call hand event handler
					// this event will not be taken by
					// any other bubbled gesture handler
					gesture.handle.apply(gesture, arguments)
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
					// pageX : evt.pageX,
					// pageY : evt.pageY,
					// clientX : evt.clientX,
					// clientY : evt.clientY,
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
				if (jQuery.inArray(finger.id, gesture.ordered) == -1)
				{

					// bind event handlers to release button
					jQuery(el).bind('mouseup', data, handler)
					          .bind('mousemove', data, mover)
					          .bind('mousewheel', data, handler)
					          .bind('trapmouseup', data, handler)
					          .bind('trapmousemove', data, mover)
					          .bind('trapmousewheel', data, handler);


					// bind on document to fetch mouseup not on target
					jQuery(document).bind('mouseup', data, handler)
					                .bind('mousemove', data, mover)
					                .bind('mousewheel', data, handler)
					                .bind('trapmouseup', data, handler)
					                .bind('trapmousemove', data, mover)
					                .bind('trapmousewheel', data, handler);

		 			// do not enable this, strange bug in IE
		 			// investigate why target stays the same
		 			// if(el.setCapture) { el.setCapture(); }

				}

				// emmit this event on the element
				// this will bubble up to propably
				// more gesture handlers, use setup
				// to decide on each gesture if you
				// would like to use that finger
				jQuery(el).trigger(event)

			}
			// @@@ EO private fn: handleMouseDownEvent @@@


			// @@@ private fn: handleMouseUpEvent @@@
			handler['mouseup'] = function (evt)
			{

				var ids = {}

				// fixIeMouseButtonWhich(evt);

				ids[evt.which] = evt.data;

				if (
					evt.clientX < 0 || evt.clientY < 0 ||
					evt.clientX > jQuery(window).width() ||
					evt.clientY > jQuery(window).height()
				)
				{
		/*
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
		*/
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
						// pageX : evt.pageX,
						// pageY : evt.pageY,
						// clientX : evt.clientX,
						// clientY : evt.clientY,
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

					// do not enable this, strange bug in IE
					// investigate why target stays the same
					// if(el.releaseCapture) { el.releaseCapture(); }

					// bind event handlers to release button
					jQuery(el).unbind('mouseup', handler)
					          .unbind('mousemove', mover)
					          .unbind('mousewheel', handler)
					          .unbind('trapmouseup', handler)
					          .unbind('trapmousemove', mover)
					          .unbind('trapmousewheel', handler);

					// bind on document to fetch mouseup not on target
					jQuery(document).unbind('mouseup', handler)
					                .unbind('mousemove', mover)
					                .unbind('mousewheel', handler)
					                .unbind('trapmouseup', handler)
					                .unbind('trapmousemove', mover)
					                .unbind('trapmousewheel', handler);

				}

			}
			// @@@ EO private fn: handleMouseUpEvent @@@

			prototype.init.push(function (el)
			{

				jQuery(el).bind('mousedown', jQuery.proxy(this.handle, this))

			});

	}

	})(OCBNET.Gestures.prototype);

})(jQuery);
// EO private scope