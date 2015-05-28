/**
 * sign in to amazon.
 * reference from https://gist.github.com/dariusk/4072489
 */
(function () {
	'use strict';
	var args = require('system').args;

	if (args.length < 4) {
		console.error("Usage:\n\tphantomjs [phantom arguments] amazon.js [username] [password] [interval]");
		phantom.exit(1);
	}

	/*
	 special log format that will send data back out to the parent process
	 */
	var emitEvent = function (msg) {
		if (typeof msg === "string") {
			if (msg.indexOf("//@@") === 0) {
				console.info(msg);
			} else {
				console.info("//@@" + msg + "@@//");
			}
		} else {
			console.info("//@@" + JSON.stringify(msg) + "@@//");
		}
	};

	var url = "https://www.amazon.com/ap/signin?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.assoc_handle=amzn_dp_project_dee&openid.return_to=https%3A%2F%2Fpitangui.amazon.com";
	var username = args[1];
	var password = args[2];
	var polling = parseInt(args[3], 10);

	var loadInProgress = false;
	var stepIndex = 0, interval = 0;
	var loginSuccess = false;

	var steps = [

		function () {
			emitEvent({"event": "open", "data": url});
			page.open(url);
		},

		function () {
			emitEvent({"event": "authenticating", "data": {"username": username}});
			page.evaluate(function (username, password) {
				document.querySelector("#ap_email").setAttribute("value", username);
				document.querySelector("#ap_password").setAttribute("value", password);
				document.querySelector("#ap_signin_form").submit();
			}, username, password);
		}
	];


	var page = require('webpage').create();
	page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.6 Safari/537.11";

	//ignoring css
	page.onResourceRequested = function (requestData, request) {
		if ((/http:\/\/.+?\.css/gi).test(requestData['url']) || requestData.headers['Content-Type'] == 'text/css') {
			request.abort();
		}
	};

	page.onLoadStarted = function () {
		loadInProgress = true;
	};

	page.onLoadFinished = function () {
		loadInProgress = false;
		if (loginSuccess) {
			page.evaluate(function () {
				console.log("//@@" + JSON.stringify({"event": "data", "data": document.body.innerText}) + "@@//");
			});
		}
	};

	page.onConsoleMessage = function (msg) {
		if (typeof msg === "string" && msg.indexOf("//@@") === 0) {
			emitEvent(msg);
		} else {
			emitEvent({"event": "console", "data": msg});
		}
	};

	interval = setInterval(function () {
		if (!loadInProgress && typeof steps[stepIndex] == "function") {
			steps[stepIndex]();
			stepIndex++;
		}

		//no more step
		if (typeof steps[stepIndex] !== "function") {
			loginSuccess = true;
			clearInterval(interval);
			interval = setInterval(function () {
				page.open("https://pitangui.amazon.com/api/activities?size=1&offset=1");
			}, polling);
		}
	}, 50);
})();