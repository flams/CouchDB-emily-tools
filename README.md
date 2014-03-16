## What is CouchDB-emily-tools?

CouchDB Emily tools synchronizes an Emily key/value observable store with a couchDB document, view or bulk of documents. It can further manipulate CouchDB User and Security documents. The exact same code will work in both the browser and in node.js, the only difference being the transport layer.

####It can manipulate CouchDB documents:

* Get a CouchDB document and save it in a JavaScript object
* Update the JavaScript object when the document is updated in the database
* Upload a modified document to the database
* Create a document
* Remove a document
* publishes events when a property on the JavaScript object is added/removed/updated

####It can manipulate CouchDB views:

* Get a CouchDB view and save it in a JavaScript array
* Update the JavaScript array when a document is added or removed from the databae
* Update the JavaScript array when a document is updated in the database
* publishes events when a document on the JavaScript array is added/removed/updated

####It can manupulate CouchDB bulk documents:

* Get a CouchDB bulk of documents and save it in a JavaScript array
* Update the JavaScript array when a document is added or removed from the databae
* Update the JavaScript array when a document is updated in the database
* Update the database when one of the documents is updated
* Add or remove documents in the database when they are add or removed from the JavaScript array
* publishes events when a document on the JavaScript array is added/removed/updated

In other words, CouchDB emily tools will reflect the status of your CouchDB in observable JavaScript data stores, and you can subscribe to their changes to update the views.

####It's a subtype of an Emily observable store:

http://flams.github.io/emily/#store

* It has getters/setters and update methods
* It publishes events when a property is added/modified
* It can be based on a JavaScript object for a key/value store
* It can be based on a JavaScript Array for an ordered list of items
* It can dump its current state


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

		// and we can also remove the document from CouchDB if we want.
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
	CouchDBTools = require("couchdb-emily-tools");

// The url to CouchDB can be configured, it's localhost by default
CouchDBTools.configuration.hostname: "my.ip.address";

// The port can be configured too; 5984 being the default one
CouchDBTools.configuration.port: 5984;

// Add the CouchDB handler to Emily. The handler is what issues the requests to CouchDB
emily.handlers.set("CouchDB", CouchDBTools.handler);

// Now we can require and use the CouchDB Tools, here's an example with a document.
CouchDBTools.requirejs(["CouchDBDocument", "Transport"], function (CouchDBDocument, Transport) {

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

####On the client side

CouchDB-emily-tools requires Olives to work on the client side. Olives embeds Emily for you.
It also expects you to have socket.io installed, and a store for storing sessions, like redis store, which is the only supported for now. In future implementations, redis store will probably be optional and an adapter will be accepted to any other store.
[An example can be found in the suggestions application](https://github.com/podefr/suggestions/blob/master/server.js)

```bash
npm install olives couchdb-emily-tools
```

The server side has some specific configuration:

```js
var olives = require("olives"),
	CouchDBTools = require("couchdb-emily-tools");

// sessionStore is a new redis-store: https://npmjs.org/package/connect-redis
CouchDBTools.configuration.sessionStore = sessionStore;

// The name of the cookie sent to the client must be set too
CouchDBTools.configuration.CookieID: "myApplication";

// Add the CouchDB handler to Olives
olives.handlers.set("CouchDB", CouchDBTools.handler);
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

##API

After you've installed CouchDB Emily tools for use either on the server or the client side, you are ready to play with it. To cope with the asynchronous nature of database operations, CouchDB Emily Tools returns a new promise for each asynchronous method call, such as 'sync', 'upload' or 'remove'.

As the tools are based on Emily, the promises are completely compliant with the Promise/A+ specs, so you know how they work. The only extra feature that is added to Promise/A+ is the ability to give an extra scope to the fulfillment/error callbacks. All the examples below are valid:

```js
couchDBDocument.sync("database", "document")

.then(this.onSuccess, this);

// or
.then(this.onSuccess, this.onError);

// or
.then(this.onSuccess, this, this.onError);

// or
.then(this.onSuccess, this, this.onError, this);

// or
.then(this.onSuccess, this.onError, this);
```

Also, when a handler returns a new promise, the current promise will be resolved when the new one does.
This basically allows you nicely chain operations on a couchDB tool, such as:

```js
newDocument.sync("database", "newDocument")

.then(function () {
	// Creates the document
	return this.upload();
}, newDocument)

.then(function () {
	// Updates the document
	this.set("property", "hello");
	return this.upload();
}, newDocument)

.then(function () {
	// Removes the document
	this.remove();
}, newDocument);
```

##CouchDBDocument API

CouchDBDocument is designed to allow you to perform all of the operations that are possible using standard HTTP requests.

#### Creating a CouchDBDocument

```js
tools.requirejs(["CouchDBDocument", "transport"], function (CouchDBDocument, transport) {

	var couchDBDocument = new CouchDBDocument();

	// check the installation section to see how to create the transport layer
	// depending on the environment (browser or node.js)
	couchDBDocument.setTransport(transport);

});
```

#### Synchronizing with a document

```js
couchDBDocument.sync("myDatabase", "myDocument").then(...);

// this will save the following in the store's internal object:
//{"_id":"myDocument","_rev":"50-edaa4bb883be679e9407d7c4c0da15d6","name":"couchdb emily tools"}

couchDBDocument.get("name"); // couchdb emily tools
```

#### Synchronizing with a document with extra parameters, like a previous revision

You just have to add an extra JSON object that will be serialized to look like:

?rev=49-2eafd494d37475e4a2ca7255f6e582f2

```js
couchDBDocument.sync("myDatabase", "myDocument", {
	"rev": "49-2eafd494d37475e4a2ca7255f6e582f2"
}).then(...);
```

#### Creating a new document

```js
couchDBDocument.sync("myDatabase", "newDocument").then(function () {
	this.upload();
}, couchDBDocument);
```

#### Removing an existing document

```js
couchDBDocument.sync("myDatabase", "oldDocument").then(function () {
	this.remove();
}, couchDBDocument);
```

#### Updating an existing document

```js
couchDBDocument.sync("myDatabase", "oldDocument").then(function () {
	// Will add or update the newField property to the document
	this.set("newField", "myValue");

	// Will update it in CouchDB
	this.upload();
}, couchDBDocument);
```

#### Unsynchronizing a synchronized document so it can be synchronized with another doc

```js
couchDBDocument.sync("myDatabase", "oldDocument").then(funciton () {
	this.unsync();
}, couchDBDocument);

couchDBDocument.sync("myDatabase", "otherDocument").then(...);
```

#### Listening for changes on a document

couchDBDocuments are a subtype of Emily's Store, so they publish events. When a document is updated in CouchDB, the changes are reflected in all synchronized CouchDBDocument.

```js
documentA.sync("myDatabase", "myDocument").then(function () {
	this.watchValue("field", function (newValue) {
		console.log(newValue); // Will log "hello!" when documentB will be uploaded!
	}, this);
}, documentA);

documentB.sync("myDatabase", "myDocument").then(function () {
		this.set("field", "hello!");
		this.upload();
}, documentB);
```

#### Attachements

Attachements are not yet supported, but if you clap your hands enough, it will eventually come :)

##CouchDBView API

#### Creating a CouchDBView

```js
tools.requirejs(["CouchDBView", "transport"], function (CouchDBView, transport) {

	var couchDBView = new CouchDBView();

	// check the installation section to see how to create the transport layer
	// depending on the environment (browser or node.js)
	couchDBView.setTransport(transport);

});
```

#### Synchronizing with a CouchDB View

A CouchDB View is readonly. Synchronizing a CouchDBView will return a list of documents that will be saved in the data store as documents in a JavaScript array.
In a couchDBView, the document's properties are saved in the 'value' object.

```js
couchDBView.sync("myDatabase", "myDesignDocument", "_view/myView").then(function () {

 // {
 //	 "id" : "documentA",
 //	 "key" : "documentA",
 //	 "value" : {
 //		"_id" : "documentA",
 //		"_rev" : "25-201d5eb10f46c4a85676ff44540a4f1e",
 //		"newProperty" : "hello!"
 //	 }
 // }
 couchDBView.get(0);

 // The number of items in the view
 couchDBView.count();

});
```

#### Adding extra parameters

Adding parameters to the request is as easy as adding an extra object. CouchDBView will serialize it.

```js
couchDBView.sync("myDatabase", "myDesignDocument", "_view/myView", {
	startkey: "documentA",
	endKey: "documentZ",
	limit: 10,
	skip: 10
}).then(...);
```

#### Watching for document added

When a new document appears in the current view, a "added" event is published

```js
couchDBView.watch("added", function onDocumentAdded(index, value) {

	this.get(index) === value;

}, couchDBView);
```

### Watching for document updated

When a document is updated in CouchDB, couchDBView will publish an "updated" event

```js
couchDBView.watch("updated", function onDocumentUpdated(index, value) {

	this.get(index) === value;

}, couchDBView);
```

### Watching for updates on a given document

```js
couchDBView.watchValue(0, function (newValue, action) {

	this.get(0) === newValue;

	action; // "updated"

});
```

### Watching for document removed

When a document is removed in CouchDB, couchDBView will publish a "deleted" event

```js
couchDBView.watch("deleted", function onDocumentDeleted(index) {

	this.get(index); // undefined

}, couchDBView);
```

#### Unsynchronizing a CouchDBView:

Unsynching is required for synchronizing the store on another view.

```js
couchDBView.unsync();
```

##CouchDBBulkDocuments API

CouchDBBulkDocuments synchronizes the data store with a bulk of documents. New documents can be added or removed to the bulk documents to alter the database. This allows for batch updates of CouchDB.

#### Creating a CouchDBBulkDocuments

```js
tools.requirejs(["CouchDBBulkDocuments", "transport"], function (CouchDBBulkDocuments, transport) {

	var couchDBBulkDocuments = new CouchDBBulkDocuments();

	// check the installation section to see how to create the transport layer
	// depending on the environment (browser or node.js)
	couchDBBulkDocuments.setTransport(transport);

});
```

#### Synchronizing with a bulk of CouchDB documents

In a couchDBBulkDocuments, the document's properties are saved in the 'doc' object.

```js
couchDBBulkDocuments.sync("myDatabase", {
	keys: ["document1", "document2", "document3"]
}).then(function () {

	// {
	// 	"id" : "document2",
	// 	"key" : "document2",
	// 	"value" : {
	// 		"rev" : "31-73ef4535724ff2db0a2361c1dab813e7"
	// 	},
	// 	"doc" : {
	// 		"_id" : "document2",
	// 		"_rev" : "31-73ef4535724ff2db0a2361c1dab813e7"
	// 	}
	// }
	this.get(1);

	this.count(); // 3

});
````

### Updating one or several documents

CouchDBBulkDocuments can also update documents in CouchDB by uploading the changes done in the data store.

```js
// The first document now has a myProperty property with newValue
couchDBBulkDocuments.update(0, "doc.myProperty", "newValue");

// The 4th document too
couchDBBulkDocuments.update(3, "doc.myProperty", "newValue");

// Upload uploads all of them
couchDBBulkDocuments.upload();
````

### Removing one or several documents

CouchDBBulkDocuments can remove one or several documents by adding them the _deleted property set to true.

```js
couchDBBulkDocuments.loop(function (document) {
	document.doc._deleted = true;
}, this);

couchDBBulkDocuments.upload();
````


## Changelog

###3.0.0 - 16 MAR 2014

* remove requirejs
* now works with Emily.js and Olives.js version 2.0.0

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
