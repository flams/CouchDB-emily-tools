/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBSecurity",["CouchDBStore"],function(e){function d(){var b="_security";this.setName=function(c){return c?(b=c,true):false};this.getName=function(){return b};this.load=function(c){return this.sync(c,b)}}return function(){d.prototype=new e;return new d}});
define("CouchDBUser",["CouchDBStore"],function(e){function d(){var b="_users",c="org.couchdb.user:";this.getUserDB=function(){return b};this.setUserDB=function(a){return a?(b=a,true):false};this.getIdPrefix=function(){return c};this.setIdPrefix=function(a){return a?(c=a,true):false};this.setId=function(a){return a?(this.set("_id",c+a),true):false};this.getId=function(){return this.get("_id")};this.load=function(a){return a?this.sync(b,c+a):false}}return function(){d.prototype=new e;return new d}});
define("CouchDBUsers",["Promise"],function(e){return function(){var d=null;this.setTransport=function(b){return b instanceof Object?(d=b,true):false};this.getTransport=function(){return d};this.login=function(b,c){var a=new e;typeof b=="string"&&typeof c=="string"?d.request("CouchDB",{method:"GET",path:"/_users/org.couchdb.user:"+b,auth:b+":"+c},a.resolve,a):a.reject({error:"name & password must be strings"});return a}}});
