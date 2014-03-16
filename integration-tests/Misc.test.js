/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var emily = require("emily"),
    tools = require("../tools"),
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
 * Synchronization with a CouchDBDocument that can't be sent by the server in one frame
 */
var CouchDBDocument = tools.CouchDBDocument,
    Transport = emily.Transport;

var couchDBDocument = new CouchDBDocument,
    transport = new Transport(handlers);

couchDBDocument.setTransport(transport);

couchDBDocument.sync("test", "documentToWatch")

.then(function () {
    //this.watchValue("long field", function () {
        console.log(this.toJSON())
    //})
}, couchDBDocument, catchError);


process.on('uncaughtException', catchError);

