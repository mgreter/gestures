

		jQuery(function()
		{

/*
jQuery(document).bind('trapmousemove', function()
{

	console.log('trapD MOUSEMOVE');

});
*/
/*
			jQuery('#red').bind('mouseup', function(evt, data)
			{
				console.log('el up');
			});
			jQuery('#red').bind('mousedown', function(evt, data)
			{
		// prevent default action, otherwise
		// we would not receive mouse up events
		if (evt.button != 0) evt.preventDefault();
			jQuery(document).bind('mouseup', function(evt, data)
			{
				console.log('doc up');
			});

			});

			jQuery('#red').bind('click', function(evt, data)
			{

				console.log('el click');

			})
*/

jQuery('#green').bind('touchstart', function(evt)
{

	evt.stopImmediatePropagation();
	evt.preventDefault();
	return false;

});

			var colors = ['red', 'blue', 'green'];

			jQuery.each(colors, function (i, color)
			{


				jQuery('#' + color).gesture({

					stop: function (changes) { console.log('STOP HAND', color, this.distance, this.rotation); },
					move: function (changes) { console.log('MOVE HAND', color, this.distance, this.rotation); },
					transform: function (changes, evt) { console.log('TRANSFORM HAND', color, this.distance, this.rotation); evt.preventDefault(); },
					swipe: function (sector, changes) { console.log('SWIPE HAND', color, sector, this.distance, this.rotation); },

					start: function (evt, finger)
					{
						if (this.count < i + 1)
						{
							evt.stopPropagation();
							return true;
						}
					}

				});

/*

				jQuery('#' + color).bind('fingerdown', function (evt)
				{
					// evt.stopPropagation()
				});

				jQuery('#' + color).bind('fingermove', function (evt)
				{
					evt.stopPropagation()
				});
*/

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

				var hand = jQuery('#' + div).data('hand');
var attr = ['count', 'finger', 'el', 'order', 'swipeSector', 'rotation', 'distance'];
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
							else
							{
								html += i + ": [obj]<br>";
								for (var n in val)
								{
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
