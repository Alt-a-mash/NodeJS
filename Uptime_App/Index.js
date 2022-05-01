/*
* Primary file for the API
* NodeJS/Uptime_App
* type nul > fileName
*/

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');

// Declare the app
var app = {};

// Init function
app.init = function() {
  // Start the Server
  server.init();

  // Start the Workers
  workers.init();

};

// Execute
app.init();

// Export the app
module.exports = app;
