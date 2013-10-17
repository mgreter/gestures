jQuery(function()
{

	jQuery('#log').html('');

});

var logs = [];

var logger = console.log;

console.breaker = function ()
{
	jQuery('#log').html('<hr>' + jQuery('#log').html())
}

console.log = function (asd)
{

	logs.unshift([].join.call(arguments, ', '));

	var now = new Date();

	while (logs.length > 25) logs.pop();

	logs[0] = now.getTime() + ': ' + logs[0];

	jQuery('#log').html('<pre>' + logs.join('<br>') + '</pre>')

}
