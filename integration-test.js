var emily = require("emily"),
	tools = require("./tools");

emily.handlers.set("CouchDB", tools.handler);

tools.requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

	var cdb = new CouchDBStore,
		transport = new Transport(emily.handlers);

	cdb.setTransport(transport);

	cdb.sync("test", "mydocument")
	.then(function () {
		console.log(cdb.toJSON());
	}, function (error) {
		console.log(error);
	});
});
