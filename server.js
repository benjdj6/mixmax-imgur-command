var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sync = require('synchronize');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
var https = require('https');

var key = fs.readFileSync('sslcert/server.key', 'utf8');
var cert = fs.readFileSync('sslcert/server.crt', 'utf8');

var cred = {key: key, cert: cert};

app.use(function(req, res, next) {
  sync.fiber(next);
});

var corsOptions = {
  origin: /^[^.\s]+\.mixmax\.com$/,
  credentials: true
};

//route to suggestion and resolver endpoints
app.get('/typeahead', cors(corsOptions), require('./routes/typeahead'));
app.get('/resolver', cors(corsOptions), require('./routes/resolver'));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(cred, app);

httpServer.listen(8080);
httpsServer.listen(8443);