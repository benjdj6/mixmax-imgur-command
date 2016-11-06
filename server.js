var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sync = require('synchronize');
var cors = require('cors');

app.use(function(req, res, next) {
  sync.fiber(next);
});

app.listen(process.env.PORT || 8080);