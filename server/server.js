'use strict';
global.log = console.log;
require('dotenv').config();
var path = require('path');
var loopback = require('loopback');
var boot = require('loopback-boot');
var ejs = require('ejs');

var app = module.exports = loopback();

app.start = function () {
  // start the web server
  app.get('/apple-app-site-association', function (req, res) {
    res.sendFile(path.join(__dirname + '/appleJsonFiles/apple-app-site-association'));
  });
  app.get('/thank_you', (req, res) => res.sendFile(path.join(__dirname + '/models/user/remote_methods/template/thank_you.html')));
  app.get('/error', (req, res) => res.sendFile(path.join(__dirname + '/models/user/remote_methods/template/error.html')));

  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;
  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

