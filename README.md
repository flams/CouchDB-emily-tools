## What is CouchDB-emily-tools?

CouchDB Emily tools synchronizes an Emily key/value observable store with a couchDB document, view or bulk of documents. It can further manipulate CouchDB User and Security documents.

Synchronizing a CouchDBDocument to an existing document is as easy as:

```js
	var couchDBDocument = new CouchDBDocument();

	// Transport will make the link to the node.js server that issues the request.
	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("myDatabase", "myDocument")

	.then(function () {
		// Will return the structure of the document exactly as it exists in the database
		couchDBDocument.toJSON();
	});
```

##How to install it?

####In node.js

```bash
npm install emily couchdb-emily-tools
```

```js
var emily = require("emily"),
	tools = require("couchdb-emily-tools");

emily.handlers.set("CouchDB", tools.handler);

tools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

	var cdb = new CouchDBDocument,
		transport = new Transport(emily.handlers);

	cdb.setTransport(transport);

	cdb.sync("mydatabase", "mydocument")
	.then(function () {
		console.log(cdb.toJSON());
	}, function (error) {
		console.log(error);
	});
});
```

###On the client side

CouchDB-emily-tools requires Olives to work on the client side. Olives embedds Emily for you.
It also expects you to have socket.io installed, and a store for storing sessions, like redis store.
In future implementations, redis store will probably be optional and an adapter will be accepted to any other store.
[An example can be found in the suggestions application](https://github.com/podefr/suggestions/blob/master/server.js)

```bash
npm install olives couchdb-emily-tools
```

```js
var olives = require("olives"),
	tools = require("couchdb-emily-tools");

// sessionStore can be a new RedisStore for instance
CouchDBTools.configuration.sessionStore = sessionStore;

// Add the CouchDB handler to Olives
olives.handlers.set("CouchDB", tools.handler);
```

And on the client side:

```html
<scirpt src="requirejs.js" />
<script src="/socket.io/socket.io.js" />
<script src="Emily.js" />
<script src="Olives.js" />
<script src="CouchDBTools.js" />
```

```js
requirejs(["CouchDBDocument", "SocketIOTransport"], function (CouchDBDocument, SocketIOTransport) {

	var socket = io.connect("http://localhost"),
		cdb = new CouchDBDocument,
		transport = new SocketIOTransport(socket);

	cdb.setTransport(transport);

	cdb.sync("mydatabase", "mydocument")
	.then(function () {
		console.log(cdb.toJSON());
	});
});
```

## Changelog

####2.0.0 - 27 APR 2013

* Complete refactoring of the tools. Documents, BulkDocuments and Views are in distinct files.
* Fixed bugs in document creation/update
* Fixed bulk docs not updating the rev id after upload
* document.remove also returns a promise
* When a document doesn't exist, the promise is now fulfilled instead of rejected
* CouchDBStore doesn't exist anymore, a specific CouchDBView, CouchDBDocument or CouchDBBulkDocuments must be used instead

####1.0.6 - 27 MAR 2013

* Aborting a non established connection doesn't fail anymore

####1.0.5 - 25 MAR 2013

* Removed specific code imported from another application after 1.0.2
* Updated documentation

####1.0.3 - 11 MAR 2013

* Updated emily + requirejs

####1.0.2 - 01 JAN 2013

* Now using Emily 1.3.1 promises wich are fully compliant with promise/A+ specs
* Moved Emily's CouchDB handler to CouchDB Emily Tools
* Updated tests

####1.0.1 - 08 OCT 2012

* CouchDBStore Views are compatible with couchdb-lucene's

####1.0.0 - 07 OCT 2012

* CouchDBStore was removed from Emily and added to CouchDB-Emily-Tools.
* It's now a library by itself, as it concentrates more work than the rest of Emily.
