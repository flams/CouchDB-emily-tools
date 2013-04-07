/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */
define(["Store", "CouchDBBase", "Tools", "Promise", "StateMachine"],

/**
 * @class
 * CouchDBDocument synchronizes a Store with a CouchDB document
 */
 function CouchDBDocument(Store, CouchDBBase, Tools, Promise, StateMachine) {

	function CouchDBDocumentConstructor() {

		/**
		 * Set the synchronization data if valid data is supplied
		 * @param {String} database the database to sync with
		 * @param {String} document the document to request
		 * @param {Object} [optional] query an object with queryparams
		 * @returns {Object} syncInfo if valid, false if not
		 */
		 this.setSyncInfo = function setSyncInfo(database, doc, query) {
			if (typeof database == "string" &&
				typeof doc == "string") {

			if (!query || (typeof query == "object")) {
					return {
						"database": database,
						"document": doc,
						"query": query || {}
					};
				} else {
					return false;
				}
			} else {
				return false;
			}
		 };

		/**
		 * Get a CouchDB document
		 * @private
		 */
		 this.onSync = function onSync() {

			var _syncInfo = this.getSyncInfo();

			this.getTransport().request(
				this.getHandlerName(),
				{
					method: "GET",
					path: "/" + _syncInfo.database + "/" + _syncInfo.document,
					query: _syncInfo.query
				},
				function (results) {
					var json = JSON.parse(results);
					if (json._id) {
						this.reset(json);
						this.getPromise().fulfill(this);
						this.getStateMachine().event("onListen");
					} else {
						this.getPromise().reject(results);
					}
				}, this);
		 };

		/**
		 * Subscribe to changes when synchronized with a document
		 * @private
		 */
		 this.onListen = function onListen() {

			var _syncInfo = this.getSyncInfo();

			this.stopListening = this.getTransport().listen(
				this.getHandlerName(),
				{
					path: "/" + _syncInfo.database + "/_changes",
					query: {
						feed: "continuous",
						heartbeat: 20000,
						descending: true
					}
				},
				function (changes) {
					var json;
					// Should I test for this very special case (heartbeat?)
					// Or do I have to try catch for any invalid json?
					if (changes == "\n") {
						return false;
					}

					json = JSON.parse(changes);

					// The document is the modified document is the current one
					if (json.id == _syncInfo.document &&
						// And if it has a new revision
						json.changes.pop().rev != this.get("_rev")) {

						if (json.deleted) {
							this.getStateMachine().event("remove");
						} else {
							this.getStateMachine().event("change");
						}
					}
				}, this
				);
		 };

		/**
		 * Update the document when synchronized with a document.
		 * @private
		 */
		 this.onChange = function onChange() {

			var _syncInfo = this.getSyncInfo();

			this.getTransport().request(
				this.getHandlerName(),
				{
					method: "GET",
					path: "/"+_syncInfo.database+"/" + _syncInfo.document
				},
				function (doc) {
					this.reset(JSON.parse(doc));
				}, this
				);
		 };

		/**
		 * Delete all document's properties
		 * @private
		 */
		 this.onRemove = function onRemove() {
			this.reset({});
		 };

		/**
		 * Upload the document to the database
		 * @returns true if synched
		 */
		 this.upload = function upload() {
			var promise = new Promise,
			_syncInfo = this.getSyncInfo();

			if (_syncInfo.document) {
				this.getStateMachine().event("upload", promise);
				return promise;
			}

			return false;
		 };

		/**
		 * Remove the document from the database
		 * @returns true if remove called
		 */
		 this.remove = function remove() {

			var _syncInfo = this.getSyncInfo();

			if (_syncInfo.document) {
				return this.getStateMachine().event("removeFromDatabase");
			}
			return false;
		 };

		/**
		 * Put a new document in CouchDB
		 * @private
		 */
		 this.databaseCreate = function createDocument(promise) {

			var _syncInfo = this.getSyncInfo();

			this.getTransport().request(
				this.getHandlerName(),
				{
					method: "PUT",
					path: "/" + _syncInfo.database + "/" + _syncInfo.document,
					headers: {
						"Content-Type": "application/json"
					},
					data: this.toJSON()
				},
				function (result) {
					var json = JSON.parse(result);
					if (json.ok) {
						promise.fulfill(json);
						this.getStateMachine().event("subscribeToDocumentChanges");
					} else {
						promise.reject(json);
					}
				}, this
				);
		 };

		/**
		 * Update a document in CouchDB through a PUT request
		 * @private
		 */
		 this.databaseUpdate = function updateDatabase(promise) {

			var _syncInfo = this.getSyncInfo();

			this.getTransport().request(
				this.getHandlerName(),
				{
					method: "PUT",
					path: "/" + _syncInfo.database + "/" + _syncInfo.document,
					headers: {
						"Content-Type": "application/json"
					},
					data: this.toJSON()
				},
				function (response) {
					var json = JSON.parse(response);
					if (json.ok) {
						this.set("_rev", json.rev);
						promise.fulfill(json);
					} else {
						promise.reject(json);
					}
				},
				this);
		 };

		/**
		 * Remove a document from CouchDB through a DELETE request
		 * @private
		 */
		 this.databaseRemove = function removeFromDatabase() {

			var _syncInfo = this.getSyncInfo();

			this.getTransport().request(this.getHandlerName(),
			{
				method: "DELETE",
				path: "/" + _syncInfo.database + "/" + _syncInfo.document,
				query: {
					rev: this.get("_rev")
				}
			});
		 };

		this.setStateMachine(new StateMachine("Unsynched", {

			"Unsynched": [
				["sync", this.onSync, this, "Synched"]
			],

			"Synched": [
				["listen", this.onListen, this, "Listening"],
				["unsync", function NOOP() {}, "Unsynched"],
				["upload", this.databaseCreate, this]
			],

			"Listening": [
				["unsync", this.unsync, this, "Unsynched"],
				["change", this.onChange, this],
				["add", this.onAdd, this],
				["remove", this.onRemove, this],
				["upload", this.databaseUpdate, this],
				["removeFromDatabase", this.databaseRemove, this]
			]

		}));

	}

	return function CouchDBDocumentFactory(data) {
		CouchDBDocumentConstructor.prototype = new CouchDBBase(data);
		return new CouchDBDocumentConstructor;
	};

});
