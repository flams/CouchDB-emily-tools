#CouchDB-emily-tools

A set of tools to manage and secure CouchDB from an Emily/Olives app.

Changelog is available here: https://github.com/flams/CouchDB-emily-tools/blob/master/CHANGELOG.md

###To install and use the library on the server side:

```bash
npm install emily couchdb-emily-tools
```

```js
var emily = require("emily"),
	tools = require("couchdb-emily-tools");

emily.handlers.set("CouchDB", tools.handler);

tools.requirejs(["CouchDBStore", "Transport"], function (CouchDBStore, Transport) {

	var cdb = new CouchDBStore,
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




