/*
 https://github.com/flams/CouchDB-emily-tools
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
*/
define("CouchDBSecurity",["CouchDBStore"],function(d){function c(){var b="_security";this.setName=function(a){return a?(b=a,true):false};this.getName=function(){return b};this.load=function(a){return this.sync(a,b)}}return function(){c.prototype=new d;return new c}});
define("CouchDBUser",["CouchDBStore"],function(d){function c(){var b="_users",a="org.couchdb.user:";this.getUserDB=function(){return b};this.setUserDB=function(a){return a?(b=a,true):false};this.getIdPrefix=function(){return a};this.setIdPrefix=function(b){return b?(a=b,true):false};this.setId=function(b){return b?(this.set("_id",a+b),true):false};this.getId=function(){return this.get("_id")};this.load=function(c){return c?this.sync(b,a+c):false}}return function(){c.prototype=new d;return new c}});
define("CouchDBUsers",["Transport","Promise"],function(d,c){return function(){var b=null;this.setTransport=function(a){return a instanceof d?(b=a,true):false};this.getTransport=function(){return b};this.login=function(a,d){var e=new c;typeof a=="string"&&typeof d=="string"?b.request("CouchDB",{method:"GET",path:"/_users/org.couchdb.user:"+a,auth:a+":"+d},e.resolve,e):e.reject({error:"name & password must be strings"});return e}}});
