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

### Run the code ###
1. git clone https://github.com/hachr/echo-home
2. cd echo-home
3. npm install
4. node example
5. enter amazon's username and password
6. start speaking to your echo.
7. see the output.

### Known Issues ###
1. phantomjs is spawned with username and password arguments hence it will show up in `ps` command
2. invalid credential is not being handled at the moment.


### Future improvements ###
1. integrate with todo list (along w/ activities)
