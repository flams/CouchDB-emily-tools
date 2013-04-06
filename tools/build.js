({
    baseUrl: "../src",
    include: ["CouchDBBase", "CouchDBDocument", "CouchDBView", "CouchDBBulkDocuments", "CouchDBUser", "CouchDBSecurity"],
    optimize: "none",
    out: "../temp.js",
    paths: {
    	"Store": "empty:",
    	"Tools": "empty:",
    	"Observable": "empty:",
    	"StateMachine": "empty:",
    	"Promise": "empty:",
    	"Transport": "empty:"
    },
})
