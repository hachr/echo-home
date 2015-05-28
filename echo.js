var cp = require('child_process');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');

function Echo() {
	EventEmitter.call(this);
	this._lastMessage = null;
	this.pid = null;
}

util.inherits(Echo, EventEmitter);


Echo.prototype.start = function (opts) {
	return doStart.apply(this, [this, opts]);
};

Echo.prototype.stop = function () {
	this.pid.kill(0);
	this.pid = null;
	this._lastMessage = null;
};


module.exports = Echo;


function md5(content) {
	if (content) {
		return crypto.createHash('md5').update(content).digest("hex");
	}
}

function doStart(self, opts) {

	opts = opts || {};
	var username = opts.username;
	var password = opts.password;
	var interval = opts.interval || '3000';

	var pid = cp.spawn('./node_modules/.bin/phantomjs', ['--web-security=true', 'amazon.js', username, password, interval]);

	self.pid = pid;
	pid.stdout.on('data', function (data) {
		var msg = cleanse(data.toString(), '\n');
		if (msg.indexOf("//@@") === 0 && msg.slice(msg.length - 4) === "@@//") {
			try {
				var content = msg.slice(4, msg.length - 4);
				var event = JSON.parse(content);
				if (event.event === "data") {
					var hash = md5(content);
					if (hash !== self._lastMessage) {

						var d = JSON.parse(event.data);
						self.emit('data', d);
						self._lastMessage = hash;
					}
				}
				self.emit('raw', event);
			} catch (e) {
				//ignore
			}
		}
	});

	pid.stderr.on('data', function (data) {
		self.emit('error', data);
	});

	pid.on('close', function (code) {
		self.emit('end', code);
	});

}

function cleanse(data) {
	return data.replace("\n", "");
}