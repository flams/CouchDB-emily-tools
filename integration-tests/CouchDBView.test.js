/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var emily = require("emily"),
    tools = require("../tools"),
    assert = require("assert"),
    http = require("http");

var handlers = new emily.Store();

http.globalAgent.maxSockets = 64;

handlers.set("CouchDB", tools.handler);

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
var CouchDBView = tools.CouchDBView,
    CouchDBDocument = tools.CouchDBDocument,
    Transport = emily.Transport,
    Promise = tools.Promise;

var couchDBView = new CouchDBView,
    couchDBDocument = new CouchDBDocument,
    transport = new Transport(handlers);

couchDBDocument.setTransport(transport);
couchDBView.setTransport(transport);

couchDBView.sync("test", "list", "_view/id")

.then(function () {
    if (this.count() > 0) {
        console.log(this.get(100))
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
    var self = this;

    setTimeout(function () {
        self.remove();
    }, 100);
}, couchDBDocument);

process.on('uncaughtException', catchError);

