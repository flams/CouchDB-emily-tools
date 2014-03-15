/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
var CouchDBDocument = require("./CouchDBDocument"),
    Promise = require("emily").Promise;

/**
 * Defines CouchDBUser
 * @returns {CouchDBUserConstructor}
 */
function CouchDBUserConstructor() {

    /**
     * the name of the table in which users are saved
     * @private
     */
    var _userDB = "_users",

    /**
     * the string which prefixes a user's id
     * @private
     */
    _idPrefix = "org.couchdb.user:";

    /**
     * Get the name of the users' db
     * @returns {String}
     */
    this.getUserDB = function getUserDB() {
        return _userDB;
    };

    /**
     * Set the name of the users' db
     * @param {String} name of the db
     * @returns {Boolean} true if name truthy
     */
    this.setUserDB = function setUserDB(name) {
        if (name) {
            _userDB = name;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the string that prefixes the users' id
     * @returns {String}
     */
    this.getIdPrefix = function getIdPrefix() {
        return _idPrefix;
    };

    /**
     * Set the string that prefixes the users' id
     * @param {String} name string that prefixes the users' id
     * @returns {Boolean} true if name truthy
     */
    this.setIdPrefix = function setIdPrefix(name) {
        if (name) {
            _idPrefix = name;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Set user's id
     * @param {String} id
     * @returns {Boolean} true if id truthy
     */
    this.setId = function setId(id) {
        if (id) {
            this.set("_id", _idPrefix + id);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the user's id
     * @returns {String} the user's id
     */
    this.getId = function getId() {
        return this.get("_id");
    };

    /**
     * Load a user given it's id
     * @param {String} id of the user (without prefix)
     * @returns {Boolean} true if sync succeeded
     */
    this.load = function load(id) {
        return this.sync(_userDB, _idPrefix + id);
    };

    /**
     * Gets the user profile in couchDB by using its own credentials.
     * name and password must be set prior to calling login, or the promise will be rejected.
     * If the login is successful, the promise is fulfilled with the user information like:
     * { _id: 'org.couchdb.user:couchdb',
     *  _rev: '1-8995e8ff247dae75048ab2dc800136d7',
     * name: 'couchdb',
     * password: null,
     * roles: [],
     * type: 'user' }
     *
     * @returns {Promise}
     */
    this.login = function login() {
        var promise = new Promise,
            name = this.get("name"),
            password = this.get("password");

        if (name && typeof name == "string" && typeof password == "string") {
            this.getTransport().request("CouchDB", {
                method: "GET",
                path: "/_users/org.couchdb.user:"+name,
                auth: name + ":" + password
            },
            promise.fulfill,
            promise);
        } else {
            promise.reject({
                error: "name & password must be strings"
            });
        }

        return promise;
    };

    /**
     * Adds a user to the database
     * The following fields must be set prior to calling create:
     * name: the name of the user
     * password: its desired password, NOT encrypted
     *
     * If not specified, the following fields have default values:
     * type: "user"
     * roles: []
     *
     * The function itself will not warn you for incorrect fields
     * but the promise that is returned will fulfilled with couchdb's reply.
     * @returns {Promise}
    */
    this.create = function create() {
        var promise = new Promise;

        if (!this.get("type")) {
            this.set("type", "user");
        }

        if (!this.get("roles")) {
            this.set("roles", []);
        }

        this.load(this.get("name")).then(function () {
            promise.reject({error: "Failed to create user. The user already exists"});
        }, function () {
            this.upload().then(function (success) {
                promise.fulfill(success);
            }, function (error) {
                promise.reject(error);
            });
        }, this);

        return promise;
    };
};

/**
 * @class
 * CouchDBUser synchronises a CouchDBDocument with a CouchDB User.
 * It also provides tools to ease the creation/modification of users.
 */
module.exports = function CouchDBUserFactory() {
    CouchDBUserConstructor.prototype = new CouchDBDocument;
    return new CouchDBUserConstructor;
};