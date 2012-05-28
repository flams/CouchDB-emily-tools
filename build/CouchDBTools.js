/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBSecurity",["CouchDBStore"],function(d){function b(){}return function(){b.prototype=new d;return new b}});
define("CouchDBUser",["CouchDBStore"],function(d){function b(){var b="_users",c="org.couchdb.user:";this.getUserDB=function(){return b};this.setUserDB=function(a){return a?(b=a,true):false};this.getIdPrefix=function(){return c};this.setIdPrefix=function(a){return a?(c=a,true):false};this.setId=function(a){return a?(this.set("_id",c+a),true):false};this.getId=function(){return this.get("_id")};this.load=function(a){return a?this.sync(b,c+a):false}}return function(){b.prototype=new d;return new b}});
