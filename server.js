var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sync = require('synchronize');
var cors = require('cors');


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

app.listen(process.env.PORT || 8080);