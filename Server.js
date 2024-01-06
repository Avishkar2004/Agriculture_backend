// Importing required modules
const express = require("express"); // Express is a web application framework for Node.js
const bodyparser = require("body-parser"); // Body-parser is used to parse incoming request bodies in middleware before your handlers
const cors = require("cors"); // CORS is a middleware that enables cross-origin resource sharing
const app = express(); // Creating an instance of the Express application
const port = 4000; // Setting the port for the server

// Enabling CORS for all routes
app.use(cors());

// Handling GET request on the root route
app.get("/", (req, res) => {
  res.send("Hello this is agriculture e-commerce website");
});

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
