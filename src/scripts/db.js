// Database
const JsStore = require('jsstore');

// functions
function getDbSchema() {

    // tabels
    let usersTabel = {
        name: 'Users',
        columns: {
            id: { primaryKey: true },
            name: { notNull: true, dataType: "string" },
            password: { notNull: true, dataType: "string" }
        }
    };
    let userProjectsTabel = {
        name: 'Projects',
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            title: { notNull: true, dataType: "string" },
            userId: { notNull: true, dataType: "number" }
        }
    };
    let tasksTabel = {
        name: 'Tasks',
        columns: {
            id: { primaryKey: true, dataType: "string" },
            title: { notNull: true, dataType: "string" },
            parent: { notNull: true, dataType: "string" },
            desc: { dataType: "string" },
            userId: { notNull: true, dataType: "number" },
            projectId: { notNull: true, dataType: "number" },
            lastDrop: {dataType: "number" }
        }
    };

    //  database
    let db = {
        name: 'projects_controller',
        tables: [usersTabel, userProjectsTabel, tasksTabel]
    }
    return db;
}

let str = 'hello'
str.contains

// executing jsstore inside a web worker
let url = (window.location.pathname).split('/');
let connectionPath;
let connection;
if(url[url.length - 1] === 'index.html'){
    connectionPath = 'node_modules/jsstore/dist/jsstore.worker.min.js';
}else {
    connectionPath = '../../node_modules/jsstore/dist/jsstore.worker.min.js'
}
connection = new JsStore.Instance(new Worker(connectionPath));

// ----------------------------------------------
//  database functions
// ----------------------------------------------

async function initJsStore() {
    let db = getDbSchema();
    let isDbCreated = await connection.initDb(db);
    if (isDbCreated === true) {
        console.log("db created");
    }
    else {
        console.log("db opened");
    }
}

// insialization
initJsStore();

async function insertRecords(value, tabName, cbFunc) {

    let noOfRowsInserted = await connection.insert({
        into: tabName,
        values: [value], //you can insert multiple values at a time
    });
    if (noOfRowsInserted > 0) {
        cbFunc();
    }
}

async function updateRecord(tabName, dataToSet, constraints) {
    let noOfRowsUpdated = await connection.update({
        in: tabName,
        set: dataToSet,
        where: constraints
    });
}

async function getRecords(tabName, constraints, orderBy) {
    let data = {
        from: tabName,
        order: {
            by: orderBy ? orderBy.colName : 'id',
            type: orderBy ? orderBy.way : 'asc'
        }
    }
    if (constraints) data.where = constraints;
    return await connection.select(data);
}

async function deleteRecords(tabName, constraints) {
    let rowsDeleted = await connection.remove({
        from: tabName,
        where: constraints
    });
}