emily = require("emily")
tools = require("./tools");

emily.requirejs(["Transport"], function (Transport) {

	emily.handlers.set("CouchDB", tools.handler);

	var t = new Transport(emily.handlers);

	t.request("CouchDB", { path: "/_all_dbs" } , function (dbs) {
		console.log(dbs);
	});
});
