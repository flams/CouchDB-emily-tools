var emily = require("emily"),
	tools = require("../tools");

emily.handlers.set("CouchDB", tools.handler);

tools.configuration.adminAuth = "couchdb:couchdb";

tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var couchDBDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("test", "doesntexist")
	.then(function () {
		console.log(couchDBDocument.toJSON());
	}, function (error) {
		console.log(error);assert.equal(false, true);
	});

});
