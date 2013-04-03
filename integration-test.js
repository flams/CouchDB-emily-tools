var emily = require("emily"),
	tools = require("./tools");

emily.handlers.set("CouchDB", tools.handler);

tools.configuration.adminAuth = "couchdb:couchdb";

tools.requirejs(["CouchDBStore", "CouchDBUser", "Transport"], function (CouchDBStore, CouchDBUser, Transport) {

	var cdb = new CouchDBStore,
		transport = new Transport(emily.handlers);

	cdb.setTransport(transport);

	cdb.sync("test", "mydocument")
	.then(function () {
		console.log(cdb.toJSON());
		cdb.watch("updated", function () {
			console.log(arguments, cdb.toJSON());
		});

		cdb.unsync();

	}, function (error) {
		console.log(error);
	});

	var uploadDoc = new CouchDBStore;

	uploadDoc.setTransport(transport);
	uploadDoc.set("test", "olives");
	uploadDoc.sync("test", "testUploadDocuments").then(function () {
		console.log("testUploadDocument uploaded");
		uploadDoc.upload();
	}, function (err) {
		console.log("testUploadDocument failed", err);
	});

	var user = new CouchDBUser;

	user.setTransport(transport);
	user.set("name", "test13");
	user.set("password", "test10");

	user.create().then(function () {
		console.log("user created");
	}, function (err) {
		console.log("user not created", err);
	});

});
