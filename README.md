## Amazon Echo integration ##

This project uses phantomjs to perform authentication, and hitting the activity page directly for the commands.

### Usage ###
<pre><code>
var Echo = require('./echo');
var echo = new Echo();

echo.on('data', function(activity){
	console.log(activity);
});

echo.start({
	username: 'username',
	password: 'password',
	interval: 2000 //poll for 2 seconds
});
</code></pre>


### Known Issues ###
1. phantomjs is spawned with username and password arguments hence it will show up in `ps` command
2. invalid credential is not being handled at the moment.


### Future improvements ###
1. integrate with todo list (along w/ activities)