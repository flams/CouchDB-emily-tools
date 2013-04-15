var emily = require("emily"),
	tools = require("../tools"),
	assert = require("assert"),
	http = require("http");

http.globalAgent.maxSockets = 64;

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

/**
 * Tested workflow:
 * Synchronization with a CouchDBView
 * Upload a new document, make sure it's picked up
 */
tools.requirejs(["CouchDBView", "CouchDBDocument", "Transport"], function (CouchDBView, CouchDBDocument, Transport) {

	var couchDBView = new CouchDBView,
		couchDBDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	couchDBDocument.setTransport(transport);
	couchDBView.setTransport(transport);

	couchDBView.sync("test", "list", "_view/id")

	.then(function (hop) {
		if (this.count() > 0) {
			success("It can synchronize a store with a view");
		}

		this.watch("added", function (idx, newDocument) {
			success("It can notify when documents are added");
		}, this);

		this.watch("updated", function (idx, newDocument) {
			if (newDocument.id == "newDocument") {
				success("It can notify when documents are updated");
			}
		}, this);

		this.watch("deleted", function (idx, newDocument) {
			success("It can notify when documents are removed");
		}, this);

	}, couchDBView)

	.then(function () {
		return this.sync("test", "newDocument");
	}, couchDBDocument)

	.then(function () {
		return this.upload();
	}, couchDBDocument)

	.then(function () {
		this.remove();
	}, couchDBDocument);


});


process.on('uncaughtException', catchError);

