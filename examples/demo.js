jQuery(function()
{


	jQuery('#green, #blue').bind('touchstart', function(evt)
	{
		/*
		evt.stopImmediatePropagation();
		evt.preventDefault();
		return false;
		*/
	});

	var colors = ['red', 'blue', 'green'];

	jQuery.each(colors, function (i, color)
	{


		jQuery('#' + color)

		// .bind('fingermove')
		// .bind('fingerup')
		// .bind('handmove')
		// .bind('handstart')
		// .bind('handstop')

		.bind('fingermove', function (evt)
		{
		})

		.bind('handswipe', function (evt, asd)
		{
			if (evt.gesture.fingers != 1) return;
			if (evt.gesture.maximum != 1) return;
		})

		.bind('fingerdown', function (evt, asd)
		{

		//	evt.preventDefault();
			// consume this finger here
			// otherwise other may get them too
		//	evt.stopPropagation();

		})
/*
		.gesture(function (hand, finger)
		{

// example 1
// swipe with one finger
// zoom with two fingers
// releasing one finger
// switches back to swipe
// or do ignore afterwards
// how to implement that?

			finger.on('move', function() { });
			finger.filter('<3').('move', function() { });
			hand.on('move', function() { });
			hand.filter(2).on('move', function() { });
			hand.on('swipe', function() { });
			hand.filter(2).on('swipe', function() { });

		})
*/
		.bind('fingerdown', function (evt)
		{

			// evt.preventDefault();
			// evt.stopPropagation();
			// evt.stopImmediatePropagation();

		})

		.gesture({

			stop: function (changes) { console.log('STOP HAND', color, " - ", this.fingers, this.distance, this.rotation); },
//			move: function (changes) { console.log('MOVE HAND', color, " - ", this.fingers, this.distance, this.rotation); },
			//swipe: function (sector, changes) { console.log('SWIPE HAND', color, sector, " - ", this.fingers, this.distance, this.rotation); },
//			transform: function (changes, evt) { console.log('TRANSFORM HAND', color, " - ", this.fingers, this.distance, this.rotation); evt.preventDefault(); },

			fingerDown: function (evt, finger)
			{

				// evt.preventDefault();

				if (this.fingers == 1)
				{
					evt.stopPropagation();
				}
				if (this.fingers > 1)
				{
					return false;
				}
			}

		})

		var events = ['fingerup', 'fingertap', 'fingersmove', 'fingerdown']; //

		jQuery.each(events, function (n, event)
		{
			jQuery('#' + color).bind(event, function (evt)
			{
				console.log(evt.type + ' on ' + color + ' @ ' + evt.timeStamp + ' (' + evt.taps + ')');
			});
		});
	});





	jQuery('#log').html('');


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

var oldlog = console.log;
var logs = [], logger = function ()
{
	// oldlog.apply(this, arguments);
}


console.logger = logger;
console.logall = oldlog;

console.breaker = function ()
{
jQuery('#log').html('<hr>' + jQuery('#log').html())
}

console.log = function (asd)
{
	// if (logger) logger.apply(this, arguments);

	logs.unshift([].join.call(arguments, ', '));

	var now = new Date();

	while (logs.length > 25) logs.pop();

	logs[0] = now.getTime() + ': ' + logs[0];

	jQuery('#log').html('<pre>' + logs.join('<br>') + '</pre>')
}

jQuery(function()
{

	function resolve (obj)
	{
		if (obj !== null)
		switch (typeof obj)
		{
			case 'object':
				if (typeof obj.id != 'undefined')
				{ return '{ID:' + obj.id + '}'; }
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

		var hand = jQuery('#' + div).data('gesture');

var attr = ['fingers', 'finger', 'el', 'ordered', 'swipeSector', 'rotation', 'distance'];
		if (hand)
		{
			for (var i in attr)
			{

				var i = attr[i];
				var val = hand[i];

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

// console.log = old;
