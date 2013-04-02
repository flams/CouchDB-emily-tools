/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBView",

["Store", "CouchDBBase", "Promise"],

/**
 * @class
 * CouchDBView synchronizes a Store with a CouchDB view
 */
function CouchDBView(Store, CouchDBBase, Promise) {

	function CouchDBViewConstructor() {

		/**
		 * It has a promise that is resolved when the store is synched
		 * @private
		 */
		var _promise = new Promise;

		/**
		 * Set the synchronization data if valid data is supplied
		 * @param {String} database the database to sync with
		 * @param {String} designDocument the design document to be used
		 * @param {String} view the name of the view to request
		 * @param {Object} [optional] query an object with queryparams
		 * @returns {Object} syncInfo if valid, false if not
		 */
		this.setSyncInfo = function setSyncInfo(database, designDocument, view, query) {
			if (typeof database == "string" &&
				typeof designDocument == "string" &&
				typeof view == "string") {

				if (!query || (typeof query == "object")) {
					return {
						"database": database,
						"design": designDocument,
						"view": view,
						"query": query
					};
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		/**
		 * Get a CouchDB view
		 * @private
		 */
		this.onSync = function onSync() {
			var _syncInfo = this.getSyncInfo();
			_syncInfo.query = _syncInfo.query || {};

			this.getTransport().request(this.getHandlerName(), {
				method: "GET",
				path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + _syncInfo.view,
				query: _syncInfo.query
			}, function (results) {
				var json = JSON.parse(results);
				if (!json.rows) {
					throw new Error("CouchDBStore [" + _syncInfo.database + ", " + _syncInfo.design + ", " + _syncInfo.view + "].sync() failed: " + results);
				} else {
					this.reset(json.rows);
					_syncPromise.fulfill(this);
					if (typeof json.total_rows == "undefined") {
						this.setReducedViewInfo(true);
					}

					_stateMachine.event("subscribeToViewChanges");
				}
			}, this);
		};

		/**
		 * Set the promise so it's returned on sync
		 */
		this.setPromise(_promise);

	}

	return function CouchDBViewFactory(data) {
		CouchDBViewConstructor.prototype = new CouchDBBase(data);
		return new CouchDBViewConstructor;
	};

});
