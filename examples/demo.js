jQuery(function()
{

	var colors = ['red', 'blue', 'green'];

	jQuery.each(colors, function (i, color)
	{

		jQuery('#' + color)

		// called to decide if finger is wanted
		// some elements may be satisfied with one finger
		// they can also decide if the want others to have it
		// or if further fingers should be
		.bind('handstart', function (evt)
		{

			// every field can take one finger
			if (evt.gesture.fingers == 0)
			{
				// do nothing (take the finger)
			}
			// this gesture has already one finger
			else if (evt.gesture.fingers == 1)
			{
				// special case on the blue rect
				if (evt.currentTarget.id == 'blue')
				{
					// do not allow more fingers
					// but do not stop propagating
					evt.preventDefault();
				}
				else
				{
					// consume this finger
					evt.stopPropagation();
				}
			}
			// there are already two fingers
			else if (evt.gesture.fingers > 1)
			{
				// do not take more fingers
				// but do not stop propagating
				evt.preventDefault();
			}

		})

		// call gesture and pass config options
		// needed to call to dispatch gesture events
		.gesture({
			swipeSectors: 2,
			swipeMinDistance: 10,
			native: { panY: true }
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

		html = div + '<br>';

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
