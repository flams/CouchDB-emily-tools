/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

var requirejs = require("requirejs"),
	http = require("http"),
	qs = require("querystring"),
	cookie = require("cookie");

requirejs(__dirname + "/build/CouchDBTools.js");

var configuration = {
	hostname: "localhost",
	port: 5984
},

handler = function (data, onEnd, onData) {

	var req;

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

	if (data.handshake) {

		var cookieJSON = cookie.parse(data.handshake.headers.cookie);

		// I don't like the split but is there a better solution?
		configuration.sessionStore.get(cookieJSON["suggestions.sid"].split("s:")[1].split(".")[0], function (err, session) {
			if (err) {
				throw new Error(err);
			} else {
				data.auth = session.auth;
				exec();
			}
		});
	} else {
		exec();
	}

	return function () {
		req.abort && req.abort();
	};
};

exports.requirejs = requirejs;
exports.handler = handler;
exports.configuration = configuration;

