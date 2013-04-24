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
 * Create an empty couchdb bulk documents (A)
 * Synchronize another CouchDB Bulk documents on a document range (B)
 * Add 5 documents to A with 3 documents within the range of store (B) and upload them
 * Make sure that B has them
 * Unsync the store with the 4 docs (A)
 * Resync it (A) with specifically 3 of the docs
 * Make sure that they are present
 */
tools.requirejs(["CouchDBBulkDocuments", "Transport"], function (CouchDBBulkDocuments, Transport) {

	var bulkDocumentsA = new CouchDBBulkDocuments([]),
		bulkDocumentsB = new CouchDBBulkDocuments([]),
		transport = new Transport(emily.handlers);

		bulkDocumentsA.setTransport(transport);
		bulkDocumentsB.setTransport(transport);

	bulkDocumentsA.sync("test", {
		startkey: '"document2"',
		endkey: '"document4"'
	})

	.then(function () {
		return bulkDocumentsB.sync("test", {
			keys: []
		});
	})

	.then(function () {
		this.alter("push", {
			doc: {
				"_id": "document1"
			}
		});

		this.alter("push", {
			doc: {
				"_id": "document2"
			}
		});

		this.alter("push", {
			doc: {
				"_id": "document3"
			}
		});

		this.alter("push", {
			doc: {
				"_id": "document4"
			}
		});

	}, bulkDocumentsB, catchError)

	.then(function () {
		var self = this;

		setTimeout(function () {
			success(self.toJSON())
		self.upload();

		}, 100);
	}, bulkDocumentsB, catchError);

});


process.on('uncaughtException', catchError);

