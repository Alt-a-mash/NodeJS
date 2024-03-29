/*
* Server-related tasks
*
*/

// Dependencies
var fs = require('fs');
var url = require('url');
var path = require('path');
var util = require('util');
var http = require('http');
var https = require('https');
var config = require('./config');
var helpers = require('./helpers');
var debug = util.debuglog('server');
var handlers = require('./handlers');
var StringDecoder = require('string_decoder').StringDecoder;

// Instantiate the server module object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res) {
  server.unifiedServer(req, res);

  // Send the response
  //res.end('Hello World\n');

  // Log the request path
  //console.log('Request received on path: ' + trimmedPath + ', with method: ' + method + ', and with these query string parameters ', queryStringObject);
  //console.log('Request received with these headers: ', headers);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res) {
  server.unifiedServer(req, res);
});

// All the server logiv for both the htto and https server
server.unifiedServer = function(req, res) {
  // Get the URL and parse it
  var parsedURL = url.parse(req.url, true);

  // Get the path
  var path = parsedURL.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  var queryStringObject = parsedURL.query;

  // Get the HTTP Method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  })

  req.on('end', function() {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use the notFound handler
    var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory, use the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJSONToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload, contentType) {

      // Determine the type of response (fallback to JSON)
      contentType = typeof(contentType) == 'string' ? contentType : 'json';

      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Return the response-parts that are content-specific
      var payloadString = '';
      if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }
      if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      // Return the response-parts that are common to all content-types
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green otherwise print red
      if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
      // debug('Returning this response: ', statusCode, payloadString);
    });

    // Send the response
    //res.end('Hello World\n');

    // Log the request path
    //console.log('Request received with this payload: ', buffer);
  });
};

// Define a request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted' : handlers.accountDeleted,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checksList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'ping' : handlers.ping,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public
};

// Init script
server.init = function() {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function() {
    // Send to console, in green
    console.log('\x1b[32m%s\x1b[0m', "The server is listening on port " + config.httpPort + " " + config.envName + " mode.");
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function() {
    // Send to console, in green
    console.log('\x1b[32m%s\x1b[0m', "The server is listening on port " + config.httpsPort + " " + config.envName + " mode.");
  });
};

// Export the module
module.exports = server;
