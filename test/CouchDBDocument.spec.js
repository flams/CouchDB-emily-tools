/**
 * https://github.com/flams/CouchDB-emily-tools
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
 */
 var CouchDBDocument = require("../src/CouchDBDocument"),
	chai = require("chai"),
    serverTools = require("../tools"),
    Transport = require("transport"),
    Store = require("observable-store"),
    Promise = require("emily").Promise,
	expect = chai.expect;

describe("Given CouchDBDocument and a transport", function () {

    var transport = new Transport(new Store({
        "CouchDB": serverTools.handler,
        "CouchDBChange": serverTools.changeHandler
    }));

    describe("When initialized", function () {
        var sut = new CouchDBDocument(),
            documentName = "document-" + Math.random();

        it("Then is a simple observable data-store", function () {
            sut.set("name", documentName);

            expect(sut.get("name")).to.equal(documentName);
        });

        describe("When synchronized with a document in CouchDB", function () {
            sut.setTransport(transport);
            var promise = sut.sync("test", "document");

            var uploadedPromise = promise.then(function () {
                sut.set("name", documentName);
                return sut.upload();
            });

            describe("When synchronizing another CouchDBDocument on the same document", function () {
                var anotherDocument = new CouchDBDocument();
                anotherDocument.setTransport(transport);
                var nextTest = new Promise();

                var uploadedDocument = uploadedPromise.then(function () {
                     return anotherDocument.sync("test", "document");
                });

                it("Then retrieves the previously uploaded document", function (done) {
                    uploadedDocument.then(function () {
                        expect(anotherDocument.get("name")).to.equal(documentName);
                        nextTest.fulfill();
                        done();
                    });
                });

                describe("When the document changes", function () {
                    var onUpdate = null,
                        updatedDocumentName = "updatedDocument" + Math.random();

                    var uploadedDocument = nextTest.then(function () {
                        sut.watchValue("name", function () {
                            onUpdate = arguments;
                        });
                        anotherDocument.set("name", updatedDocumentName);
                        return anotherDocument.upload();
                    });

                    it("Then updates the CouchDBDocument", function (done) {
                        uploadedDocument.then(function () {
                            expect(onUpdate[0]).to.equal(updatedDocumentName);
                            expect(onUpdate[1]).to.equal("updated");
                            done();
                        });
                    });

                    describe("When the document is removed", function () {
                        var removedDocument = uploadedDocument.then(function () {
                            return anotherDocument.remove();
                        });

                        it("Then empties the CouchDBDocument", function (done) {
                            removedDocument.then(function () {
                                expect(sut.get("name")).to.be.undefined;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

});
