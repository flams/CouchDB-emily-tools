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

/**
 * Tested workflow:
 *
 * document.sync() on a document that doesnt exist
 * then upload() which creates it
 * then upload() again
 * then remove()
 */
tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var couchDBDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("test", "document")

	.then(function (result) {
		this.upload();
	}, couchDBDocument, catchError)

	.then(function (result) {
		success("It can create a document that doesn't exist");
		this.upload();
	}, couchDBDocument, catchError)

	.then(function () {
		success("It's synchronized after creation");
		this.remove();
	}, couchDBDocument, catchError)

	.then(function () {
		success("It can then be removed");
	}, catchError);

});

/**
 * Test workflow:
 * couchDBDocument.sync() on a document that exists
 * then remove();
 */
tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var newDocument = new CouchDBDocument,
		existingDocument = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	newDocument.setTransport(transport);
	existingDocument.setTransport(transport);

	newDocument.sync("test", "documentToRemove")

	.then(function () {
		return newDocument.upload();
	}, catchError)

	.then(function () {
		return existingDocument.sync("test", "documentToRemove");
	}, catchError)

	.then(function () {
		return existingDocument.remove();
	}, catchError)

	.then(function () {
		existingDocument.unsync();
		return existingDocument.sync("test", "documentToRemove");
	}, catchError)

	.then(function (error) {
		if (error.reason == "deleted") {
			success("It can remove an existing document");
		}
	}, catchError);


});


process.on('uncaughtException', catchError);

