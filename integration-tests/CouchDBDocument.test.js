var emily = require("emily"),
	tools = require("../tools"),
	assert = require("assert");

emily.handlers.set("CouchDB", tools.handler);

tools.configuration.adminAuth = "couchdb:couchdb";

function catchError(error) {
	error && console.error('\u001b[31m' + error + '\u001b[0m');
}

function success(message) {
	message && console.log('\u001b[32m' + message + '\u001b[0m')
}

tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var couchDBDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("test", "document2")
	.then(function () {
		// If the document exists...
	}, function (error) {

		//
		// CouchDBDocument gives an error message when trying to synchronize with a document that doesn't exist
		//
		error = JSON.parse(error);
		assert.equal(error.reason, "missing", "It should tell if the document is missing");
		assert.equal((error.error == "not_found" || error.error == "deleted"), true, "It should give a not_found or deleted error message");
		success("CouchDBDocument gives an error message when trying to synchronize with a document that doesn't exist");
		//

	}).then(null, catchError);

	couchDBDocument.unsync();
/**
	couchDBDocument.sync("test", "document2")
	.then(function () {
		this.upload();
	}, couchDBDocument)
	.then(null, catchError);
*/
});

process.on('uncaughtException', catchError);

