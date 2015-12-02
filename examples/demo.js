jQuery(function()
{

	var colors = ['red', 'blue', 'green'];

	// functions we want natively
	// panY for vertical scrolling
	// panX for horizontal scrolling
	var native = { panY: false };

	jQuery.each(colors, function (i, color)
	{

		jQuery('#' + color)

		// called to decide if finger is wanted
		// some elements may be satisfied with one finger
		// you can decide if they want others to know about
		// this event or if it should not bubble any further
		.bind('handstart', function (evt)
		{

			// green takes 2, then abort all
			if (evt.currentTarget.id == 'green')
			{
				// has already one finger down
				if (evt.gesture.fingers == 1)
				{
					// do not allow more fingers
					// but do not stop propagating
					evt.stopPropagation();
				}
				// has already two fingers down
				else if (evt.gesture.fingers == 2)
				{
					// do not allow more fingers
					// but do not stop propagating
					evt.preventDefault();
				}
			}
			// blue takes only one, but bubble up
			else if (evt.currentTarget.id == 'blue')
			{
				// has already one finger down
				if (evt.gesture.fingers == 1)
				{
					// do not allow more fingers
					// but do not stop propagating
					evt.preventDefault();
				}
			}
			// red takes any, but green stops at 2
			else if (evt.currentTarget.id == 'red')
			{
			}

		})

		.bind('handstop', function (evt)
		{

			// green takes 2, then abort all
			if (evt.currentTarget.id == 'green')
			{
				console.info(evt.gesture.fingers);
				if (evt.gesture.fingers)
				{
					evt.preventDefault();
				}
			}

		})

		.bind('mousemove', function (evt) {

			// console.info('MOUSEMOVE', Math.random());

		})

		// call gesture and pass config options
		// needed to call to dispatch gesture events
		.gesture({
			swipeSectors: 4,
			swipeMinDistance: 10,
			// false is the default
			// hatchPointerDown: false,
			native: native
		})

		.bind('handstop', function (evt) { console.log('STOP', color); })
		.bind('handstart', function (evt) { console.log('START', color); })
		// .bind('handmove', function (evt) { console.log('MOVE', color); })
		// .bind('handswipe', function (evt) { console.log('SWIPE', color); })
		// .bind('handtranform', function (evt) { console.log('TRANFORM', color); })

	});


	jQuery(document).bind('contextmenu', function (evt)
	{
		evt.preventDefault();
	})

	function stoper (evt)
	{
		console.log('stop ' + evt.type + ' bubbling')
		evt.stopImmediatePropagation();
	}

	function consumer (evt)
	{
		console.log('consumed ' + evt.type + ' event')
		return false;
	}

	function preventer (evt)
	{
		console.log('prevent ' + evt.type + ' default')
		evt.preventDefault();
	}

	function bubbler (evt)
	{
		console.log('bubbled ' + evt.type + ' default')
	}

	function same (evt)
	{
		console.log('same event ' + evt.type + ' default')
	}

	jQuery('#mouseup-stop').bind('mouseup', bubbler)
	jQuery('#mouseup-consume').bind('mouseup', bubbler)
	jQuery('#mouseup-prevent').bind('mouseup', bubbler)

	jQuery('#mouseup-stop > DIV').bind('mouseup', stoper)
	jQuery('#mouseup-consume > DIV').bind('mouseup', consumer)
	jQuery('#mouseup-prevent > DIV').bind('mouseup', preventer)

	jQuery('#mousemove-stop').bind('mousemove', bubbler)
	jQuery('#mousemove-consume').bind('mousemove', bubbler)
	jQuery('#mousemove-prevent').bind('mousemove', bubbler)

	jQuery('#mousemove-stop > DIV').bind('mousemove', stoper)
	jQuery('#mousemove-consume > DIV').bind('mousemove', consumer)
	jQuery('#mousemove-prevent > DIV').bind('mousemove', preventer)

	jQuery('#mousemove-stop > DIV').bind('mousemove', same)
	jQuery('#mousemove-consume > DIV').bind('mousemove', same)
	jQuery('#mousemove-prevent > DIV').bind('mousemove', same)

});

jQuery(function()
{

	function resolve (obj)
	{
		if (obj !== null)
		switch (typeof obj)
		{
			case 'object':
				if (typeof obj.id != 'undefined')
				{
					if (typeof obj.x != 'undefined' && typeof obj.y != 'undefined')
					{ return ' (' + obj.x + '/' + obj.y + ')'; }
					return '{ID:' + obj.id + '}';
				}
				else return obj;
			break;
			default:
				return obj
			break;
		}
	}


	function updateLog (div)
	{

		var html = div + '<br>';

		var gesture = jQuery('#' + div).data('gesture');

		var attr = ['fingers', 'finger', 'el', 'ordered', 'center', 'rotation', 'distance', 'swipeSector'];

		if (gesture)
		{
			for (var i in attr)
			{

				var i = attr[i];
				var val = gesture[i];

				if (jQuery.isArray(val))
				{
					html += i + ": [" + val.length + "]<br>";
					for (var n = 0; n < val.length; n++)
					{
						html += '&nbsp;&nbsp;- ' + n + ': ' + resolve(val[n]) + '<br>';
					}
				}
				else if (typeof val == 'object')
				{
					if (val.get) {
						html += i + ": [" + val.length + "] " + resolve(val.get(0)) + "<br>";
					}
					else if (val.id) {
						html += i + ": " + resolve(val) + "<br>";
					}
					else
					{
						html += i + ": [obj]<br>";
						for (var n in val)
						{
							if (val.hasOwnProperty(n))
							html += '&nbsp;&nbsp;- ' + n + ': ' + resolve(val[n]) + '<br>';
						}
					}
				}
				else
				{
					html += i + ": " + resolve(val) + "<br>";
				}

			}
		}

		jQuery('#log-' + div).html('<div><pre>' + html + '</pre></div>');

	}

	window.setInterval(function()
	{

		updateLog('red');
		updateLog('blue');
		updateLog('green');

	}, 20);

});
