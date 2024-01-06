const mysql2 = require("mysql2"); // MySQL2 is a Node.js-based MySQL library

const connection = mysql2.createConnection({
    host:"localhost",
    user:"root",
    password: "",
    database:"test"
})