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

var CouchDBDocument = tools.CouchDBDocument,
    Transport = emily.Transport;


/**
 * Tested workflow:
 *
 * document.sync() on a document that doesnt exist
 * then upload() which creates it
 * then upload() again
 * then remove()
 */
var couchDBDocument = new CouchDBDocument,
    transport = new Transport(handlers);

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


/**
 * Tested workflow:
 * couchDBDocument.sync() on a document that exists
 * then remove();
 */
var newDocument = new CouchDBDocument,
    existingDocument = new CouchDBDocument,
    transport = new Transport(handlers);

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

/**
 * Tested workflow:
 * couchDBDocument.sync() on a document that exists
 * update it
 * then upload();
 */
var newDocument = new CouchDBDocument,
    existingDocument = new CouchDBDocument,
    transport = new Transport(handlers),
    rand = Math.random() + "";

newDocument.setTransport(transport);
existingDocument.setTransport(transport);

newDocument.sync("test", "documentToUpdate")

.then(function () {
    return newDocument.upload();
}, catchError)

.then(function () {
    return existingDocument.sync("test", "documentToUpdate");
}, catchError)

.then(function () {
    existingDocument.set("rand", rand);
    return existingDocument.upload();
}, catchError)

.then(function () {
    existingDocument.unsync();
    return existingDocument.sync("test", "documentToUpdate");
}, catchError)

.then(function () {
    if (existingDocument.get("rand") == rand) {
        success("It can directly update an existing document");
    }
    return existingDocument.remove();
}, catchError);

/**
 * Tested workflow:
 * sync document1 on a document
 * sync document2 on the same document
 * update document1
 * make sure document2 gets updated
 */
var document1 = new CouchDBDocument,
    document2 = new CouchDBDocument,
    transport = new Transport(handlers);

document1.setTransport(transport);
document2.setTransport(transport);

document1.sync("test", "documentToWatch")

.then(function () {
    return document1.upload();
})

.then(function () {
    return document2.sync("test", "documentToWatch");
}, catchError)

.then(function () {
    document1.watchValue("name", function (value) {
        success("Updating a document successfully update the others");
    });
}, catchError)

.then(function () {
    // Using random to make sure that the update gets triggered (if the value doesn't change, no change is triggered)
    document2.set("name", "couchdb emily tools" + Math.random());
    document2.upload();
}, catchError);


process.on('uncaughtException', catchError);

