/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var Transport = require("transport"),
    tools = require("../tools"),
    Store = require("observable-store"),
    assert = require("assert");

var transport = new Transport(new Store({
        "CouchDB": tools.handler,
        "CouchDBChange": tools.changeHandler
    }));

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
 * Remove all documents
 * Make sure they have all been removed
 */
var CouchDBBulkDocuments = require("../src/CouchDBBulkDocuments");

var bulkDocumentsA = new CouchDBBulkDocuments([]),
    bulkDocumentsB = new CouchDBBulkDocuments([]);

bulkDocumentsA.setTransport(transport);
bulkDocumentsB.setTransport(transport);

bulkDocumentsB.sync("test", {
    startkey: '"document2"',
    endkey: '"document4"'
})

.then(function () {

    this.watch("added", function (id, document) {
        success(document.id + " added");
    }, this);

}, bulkDocumentsB, catchError)

.then(function () {
    return bulkDocumentsA.sync("test", {
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

    this.alter("push", {
        doc: {
            "_id": "document5"
        }
    });

    return this.upload();
}, bulkDocumentsA, catchError)

.then(function () {
    if (this.count() == 3) {
        success("It can synchronize on a range of documents");
    }
}, bulkDocumentsB, catchError)

.then(function () {
    this.unsync();

    return this.sync("test", {
        keys: ["document2", "document3", "document5"]
    });
}, bulkDocumentsB, catchError)

.then(function () {
    if (this.count() == 3 &&
        this.get(2).id == "document5") {
        success("It can synchronize on given documents");
    }
}, bulkDocumentsB, catchError)

.then(function () {

    this.loop(function (document) {
        document.doc._deleted = true;
    }, this);

    return this.upload();
}, bulkDocumentsA, catchError)

.then(function () {
    // We wait a bit for this document to be updated
    // We could also simply whatch the remove event but this was easier
    setTimeout(function () {
        if (!this.count()) {
            success("It can remove all of the documents");
        }
    }.bind(this), 100);
}, bulkDocumentsB, catchError);

process.on('uncaughtException', catchError);
