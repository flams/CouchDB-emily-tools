/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */

var http = require("http"),
	qs = require("querystring"),
	cookie = require("cookie"),
	emily = require("emily"),
	CouchDBTools = require("./src/CouchDBTools");

var configuration = {
	hostname: "localhost",
	port: 5984,
	cookieID: ''
},

handler = function (data, onEnd, onData) {

	var req = {},
		isAborted = false;

	data.hostname = configuration.hostname;
	data.port = configuration.port;
	data.path += "?" + qs.stringify(data.query);

	var exec = function () {
		req = http.request(data, function (res) {

			var body = "";

			res.on("data", function (chunk) {
				onData && onData(chunk);
				body += chunk;
			});

			res.on("end", function () {
				onEnd(body);
			});
		});

		req.end(data.data, "utf8");
	};

	if (data.handshake && configuration.cookieID) {

		var cookieJSON = cookie.parse(data.handshake.headers.cookie);

		// I don't like the split but is there a better solution?
		configuration.sessionStore.get(cookieJSON[configuration.cookieID].split("s:")[1].split(".")[0], function (err, session) {
			if (err) {
				throw new Error(err);
			} else {
				if (!isAborted) {
					data.auth = session.auth;
					exec();
				} else {
					// do nothing!
				}

			}
		});
	} else {
		exec();
	}

	return function () {
		isAborted = true;
		req.abort && req.abort();
	};
};

module.exports = emily.Tools.mixin(CouchDBTools, {
	handler: handler,
	configuration: configuration
});