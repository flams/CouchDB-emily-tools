var emily = require("emily"),
	tools = require("../tools"),
	assert = require("assert");

emily.handlers.set("CouchDB", tools.handler);

tools.configuration.adminAuth = "couchdb:couchdb";

function catchError(error) {
	if (typeof error == "object") {
		error = JSON.stringify(error);
	}
	error && console.error('\u001b[31m' + error + '\u001b[0m');
}

function success(message) {
		if (typeof message == "object") {
		message = JSON.stringify(message);
	}
	message && console.log('\u001b[32m' + message + '\u001b[0m')
}

tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var couchDBDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("test", "document")
	.then(function (data) {
		// If the document exists...
		catchError("The document already existed and has been removed, please re-run" + JSON.stringify(data));
		this.remove();
	}, couchDBDocument,

	function (error) {

		//
		// CouchDBDocument gives an error message when trying to synchronize with a document that doesn't exist
		//
		error = JSON.parse(error);
		assert.equal((error.reason == "missing" || error.reason == "deleted"), true, "It should tell if the document is missing");
		assert.equal(error.error, "not_found", "It should give a not_found or deleted error message");
		success("CouchDBDocument gives an error message when trying to synchronize with a document that doesn't exist");
		//

	}).then(null, catchError);

	couchDBDocument.unsync();

	couchDBDocument.sync("test", "document")
	.then(null, function () {


		this.set("name", "couchDB emily tools");
		this.upload()
		.then(function () {
			success("It can create a document that doesn't exist");
		}, catchError)

		.then(function() {

			this.upload()
			.then(function () {
				success("It's synchronized after creation");

				this.remove().then(function () {
					success("It can then be removed");
				}, catchError);

			}, couchDBDocument, catchError)
			.then(success, catchError);

		}, couchDBDocument, catchError)

	}, couchDBDocument)
	.then(null, catchError);

	couchDBDocument.unsync();


});

process.on('uncaughtException', catchError);

