var request = require('request');


//This endpoint returns the in-email representation of the image.
module.exports = function(req, res) {
  //get the query param
  var term = req.query.text;

  //if query param contains imgur link
  if (/^http:\/\/imgur\.com\/\S+/.test(term)) {
    //Handle the url created from the typeahead endpoint to select a specific
    //Imgur image. 
    handleIdString(term.replace(/^http:\/\/imgur\.com\//, ''), req, res);
  } else {
    //Else, if the user presses enter before typeahead can make a suggesiton
    //handle the term and select the first image result
    handleSearchString(term, req, res);
  }
};

function handleIdString(id, req, res) {
  res.json('HELLO AGAIN!');
}

function handleSearchString(term, req, res) {
  res.json('HI FAST TYPER!');
}
