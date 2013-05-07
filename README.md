## What is CouchDB-emily-tools?

CouchDB Emily tools synchronizes an Emily key/value observable store with a couchDB document, view or bulk of documents. It can further manipulate CouchDB User and Security documents.

It can manipulate CouchDB documents:

* Get a CouchDB document and save it in a JavaScript object
* Update the JavaScript object when the document is updated in the database
* Upload a modified document to the database
* Create a document
* Remove a document
* publishes events when a property on the JavaScript object is added/removed/updated

It can manipulate CouchDB views:

* Get a CouchDB view and save it in a JavaScript array
* Update the JavaScript array when a document is added or removed from the databae
* Update the JavaScript array when a document is updated in the database
* publishes events when a document on the JavaScript array is added/removed/updated

It can manupulate CouchDB bulk documents:

* Get a CouchDB bulk of documents and save it in a JavaScript array
* Update the JavaScript array when a document is added or removed from the databae
* Update the JavaScript array when a document is updated in the database
* Update the database when one of the documents is updated
* Add or remove documents in the database when they are add or removed from the JavaScript array
* publishes events when a document on the JavaScript array is added/removed/updated

In other words, CouchDB emily tools will reflect the status of your CouchDB in observable JavaScript data stores, and you can subscribe to their changes to update the views.


Synchronizing a CouchDBDocument to an existing document is as easy as:

```js
	var couchDBDocument = new CouchDBDocument();

	// Transport will make the link to the node.js server that issues the request.
	couchDBDocument.setTransport(transport);

	couchDBDocument.sync("myDatabase", "myDocument")

	.then(function () {
		// Will return the structure of the document exactly as it exists in the database
		couchDBDocument.toJSON();
	})

	.then(function () {

		couchDBDocument.set("myProperty", "hello");

		return couchDBDocument.upload();

	})

	.then(function () {

		// At this point, the document has been updated in CouchDB with a new property
		couchDBDocument.toJSON(); // Will have a myProperty property

		// and we can now remove the document from CouchDB if we want.
		couchDBDocument.remove();
	});
```

##How to install it?

####In node.js

CouchDB Emily Tools is based on Emily

```bash
npm install emily couchdb-emily-tools
```

```js
var emily = require("emily"),
	tools = require("couchdb-emily-tools");

// Add the CouchDB handler to Emily. The handler is what issues the requests to CouchDB
emily.handlers.set("CouchDB", tools.handler);

// Now we can require and use the CouchDB Tools, here's an example with a document.
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

	// Create a socket.io socket
	var socket = io.connect("http://localhost"),

	// Create a couchDBDocument
	cdb = new CouchDBDocument,

	// And the transport that will issue the requests to CouchDB
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
