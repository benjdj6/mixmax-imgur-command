var sync = require('synchronize');
var request = require('request');
var key = require('../util/cred');
var _ = require('underscore');


//This endpoint returns the in-email representation of the image.
module.exports = function(req, res) {
  var term = req.query.text;
  if (req.query.url) {
    term = req.query.url;
  }

  //if query param contains imgur link
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

//Embeds specified image id
function handleIdString(id, req, res) {
  var response;
  //get image from imgur
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

//Get first image for specified search term in case user hits enter
//too fast for suggestions to load
function handleSearchString(term, req, res) {
  var response;
  //Get search results for term
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

  //While there are images check if it is an album, if it's not an album return
  //embeded image. Albums are avoided to provide a more intuitive user experience.
  var image;
  for (i = 0; i < response.body.data.length; i++) {
    image = response.body.data[i];
    if (!image.is_album && !image.nsfw) {
      var width = image.width > 500 ? 500 : image.cover_width;
      var html = '<blockquote class="imgur-embed-pub" lang="en" data-id="' +
          image.id + '"><a href="//imgur.com/' +
          image.id + '">' + image.title +
          '</a></blockquote><script async src="//s.imgur.com/min/embed.js" \
          charset="utf-8"></script>';

      res.json({
        body: html
      });
      return;
    }
  }

  //return no results if no images or no non-albums are found
  res.json([{
      title: '<i>(no results)</i>',
      text: term
  }]);
}
