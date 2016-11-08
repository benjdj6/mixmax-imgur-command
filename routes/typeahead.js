var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');
var key = require('../util/cred');

//Suggestions Endpoint
module.exports = function(req, res) {
  //Remove white space on ends of text and check if valid
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  //Search imgur for the specified term only selecting small images
  //and sorting by top of all-time
  var response;
  try {
    response = sync.await(request({
      url: 'https://api.imgur.com/3/gallery/search',
      headers: {
        'Authorization' : key
      },
      qs: {
        q: term,
        q_size: 'small',
        sort: 'top'
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    console.log(e);
    res.status(500).send('Error with Imgur Request');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.data) {
    res.status(500).send('Error with Imgur Request');
    return;
  }

  //Chain used to reject all data that is invalid or nsfw
  //and generate HTML to display images in the drop down 
  var results = _.chain(response.body.data)
    .reject(function(image) {
      return !image || !image.link || image.is_album || image.nsfw;
    })
    .map(function(image) {
      return {
        title: '<img style="height:75px" src="' + image.link + '">',
        text: 'https://imgur.com/' + image.id
      };
    })
    .value();

  //If no valid data then show 'no results' in drop down 
  if (results.length === 0) {
    res.json([{
      title: '<i>(no results)</i>',
      text: term
    }]);
  } else {
    res.json(results);
  }
};
