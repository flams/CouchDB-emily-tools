/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

define("CouchDBView",

["Store", "CouchDBBase"],

/**
 * @class
 * CouchDBView synchronizes a Store with a CouchDB view
 */
function CouchDBView(Store, CouchDBBase) {

	function CouchDBViewConstructor() {

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
		 * Get a CouchDB view
		 * @private
		 */
		this.onSync = function onSync() {
			var _syncInfo = this.getSyncInfo();

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
					this.getPromise().fulfill(this);
					if (typeof json.total_rows == "undefined") {
						_syncInfo.reducedView = true;
					}

					this.getStateMachine().event("subscribeToViewChanges");
				}
			}, this);
		};

	}

	return function CouchDBViewFactory(data) {
		CouchDBViewConstructor.prototype = new CouchDBBase(data);
		return new CouchDBViewConstructor;
	};

});
