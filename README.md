#CouchDB-emily-tools

A set of tools to manage and secure CouchDB from an Emily/Olives app.

###To install and use the library on the server side:

```bash
npm install emily couchdb-emily-tools
```

```js
var Emily = require("emily"),
	CouchDBTools = require("couchdb-emily-tools");

CouchDBTools.requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

	var cdb = new CouchDBStore,
		transport = new Transport(Emily.handlers);

	cdb.setTransport(transport);

	cdb.sync("mydatabase", "mydocument")
	.then(function () {
		console.log(cdb.toJSON());
	});
});
```

###To install and use the library on the client side:

place the CouchDBTools.js file into your project alongside Olives, Require.js, and socket.io

```html
<scirpt src="requirej.js" />
<script src="/socket.io/socket.io.js" />
<script src="Olives.min.js" />
<script src="CouchDBTools.js" />
```

```js
	requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

		var cdb = new CouchDBStore,
			transport = new Transport(io, location.href);

		cdb.setTransport(transport);

		cdb.sync("mydatabase", "mydocument")
		.then(function () {
			console.log(cdb.toJSON());
		});
	});
```




