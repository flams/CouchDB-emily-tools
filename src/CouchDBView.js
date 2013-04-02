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


		this.setSyncInfo = function setSyncInfo(database, designDocument, view, query) {
			if (typeof database == "string" &&
				typeof designDocument == "string" &&
				typeof view == "string") {

				if (!query || (typeof query == "object")) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
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
