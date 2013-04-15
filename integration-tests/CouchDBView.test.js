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
		console.log(couchDBView.toJSON());
	});


});


process.on('uncaughtException', catchError);

