/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */

var requirejs = require("requirejs"),
	emily = require("emily");

requirejs(__dirname + "/build/CouchDBTools.js");

// Add this to Emily's handlers

		// CouchDB is built-in
		/*"CouchDB" : function (data, onEnd, onData) {

			var cfg = exports.config.get("CouchDB"),
				req;

			data.hostname = cfg.hostname;
			data.port = cfg.port;
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
				cfg.sessionStore.get(cookieJSON["suggestions.sid"].split("s:")[1].split(".")[0], function (err, session) {
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
		}*/

// And add this to Conf
		// CouchDB is built-in
		// Copy this to CouchDB2, 3... if you have more than one of them
		/*"CouchDB": {
			hostname: "127.0.0.1",
			port: 5984
		}*/


module.exports.requirejs = requirejs;
