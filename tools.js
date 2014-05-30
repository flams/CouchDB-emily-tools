/**
 * @license https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */

var http = require("http"),
	qs = require("querystring"),
	cookie = require("cookie"),
	emily = require("emily"),
	CouchDBTools = require("./src/CouchDBTools")
    follow = require("follow");

var configuration = {
	hostname: "localhost",
	port: 5984,
	cookieID: ''
};

function handler(payload, onEnd, onData) {

	var req = {},
		isAborted = false;

	payload.hostname = configuration.hostname;
	payload.port = configuration.port;
	payload.path += "?" + qs.stringify(payload.query);

	var exec = function () {
		req = http.request(payload, function (res) {

			var body = "";

			res.on("data", function (chunk) {
				onData && onData(chunk);
				body += chunk;
			});

			res.on("end", function () {
				onEnd(body);
			});
		});

		req.end(payload.data, "utf8");
	};

	if (payload.handshake && configuration.cookieID) {

		var cookieJSON = cookie.parse(payload.handshake.headers.cookie);

		// I don't like the split but is there a better solution?
		configuration.sessionStore.get(cookieJSON[configuration.cookieID].split("s:")[1].split(".")[0], function (err, session) {
			if (err) {
				throw new Error(err);
			} else {
				if (!isAborted) {
					payload.auth = session.auth;
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
}

function changeHandler(payload, onEnd, onData) {

    var url = payload.hostname + ":" + payload.port + payload.path,
        feed = new follow.Feed(payload.query);

    feed.on('change', function (data) {
        onData(null, data);
    });
    feed.on('error', function (err) {
        onEnd(err);
        onData(err);
        throw err;
    });
    feed.follow();

    return function () {
        feed.removeAllListeners();
    }

}

module.exports = emily.Tools.mixin(CouchDBTools, {
	handler: handler,
    changeHandler: changeHandler,
	configuration: configuration
});
