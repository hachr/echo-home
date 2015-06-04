var readline = require('readline');
var Echo = require('./echo');
var echo = new Echo();


echo.on('raw', function (event) {
	console.log("raw:", JSON.stringify(event));
});

echo.on('data', function (event) {
	console.log(event);
});

echo.on('error', function(data){
	console.error(data);
});

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function readPassword(query, callback) {
	var stdin = process.openStdin();
	process.stdin.on("data", function (char) {
		char = char + "";
		switch (char) {
			case "\n":
			case "\r":
			case "\u0004":
				stdin.pause();
				break;
			default:
				process.stdout.write("\033[2K\033[200D" + query + Array(rl.line.length + 1).join("*"));
				break;
		}
	});

	rl.question(query, function (value) {
		rl.history = rl.history.slice(1);
		rl.close();
		callback(value);
	});
}

rl.question("Username : ", function (username) {
	readPassword("Password : ", function (password) {
		echo.start({
			username: username,
			password: password,
			interval: 2000
		})
	});
});

