var sync = require('synchronize');
var request = require('request');
var key = require('../util/cred');
var _ = require('underscore');


//This endpoint returns the in-email representation of the image.
module.exports = function(req, res) {
  //TODO get the query param check if url or text
  var term = req.query.text;
  if (req.query.url) {
    term = req.query.url;
  }

  console.log(term);

  //if query param contains imgur link
  //TODO implement album resolver
  if (/^https?:\/\/imgur\.com\/\S+/.test(term)) {
    //Handle the url created from the typeahead endpoint to select a specific
    //Imgur image. 
    handleIdString(term.replace(/^https?:\/\/imgur\.com\/(gallery\/)?/, ''), req, res);
  } else {
    //Else, if the user presses enter before typeahead can make a suggesiton
    //handle the term and select the first image result
    handleSearchString(term, req, res);
  }
};

function handleIdString(id, req, res) {
  var response;
  try {
    response = sync.await(request({
      url: 'https://api.imgur.com/3/gallery/' + encodeURIComponent(id),
      headers: {
        'Authorization' : key
      },
      gzip: true,
      json: true,
      timeout: 15 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error with Imgur Request');
    return;
  }

  var image = response.body.data;
  var data_id = image.id;

  //add 'a/' if album 
  if (image.is_album) {
    data_id = 'a/' + image.id;
  }

  //Insert data into html to embed image or album into email
  var html = '<blockquote class="imgur-embed-pub" lang="en" data-id="' +
      data_id + '"><a href="//imgur.com/' +
      image.id + '">' + image.title +
      '</a></blockquote><script async src="//s.imgur.com/min/embed.js" \
      charset="utf-8"></script>';

  res.json({
    body: html
  });
}

function handleSearchString(term, req, res) {
  var response;
  try {
    response = sync.await(request({
      url: 'https://api.imgur.com/3/gallery/search',
      headers: {
        'Authorization' : key
      },
      qs: {
        q : term
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error with Imgur Request');
    return;
  }
  var image;
  for (i = 0; i < response.body.data.length; i++) {
    image = response.body.data[i];
    if (!image.is_album && !image.nsfw) {
      var width = image.width > 500 ? 500 : image.cover_width;
      var html = '<img style="max-width:100%;" src="' + image.link + '" width="' + width + '"/>';
      res.json({
        body: html
      });
      return;
    }
  }
  res.json([{
      title: '<i>(no results)</i>',
      text: term
  }]);
}
