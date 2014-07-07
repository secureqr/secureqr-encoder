var db = require('../database');
var SIGNATURE = db.connection;
var formidable = require('formidable');
var crypto = require('crypto');
var domain = require('domain');
var validUrl = require("valid-url");
var async = require("async");
var config = require('../config');
var Bitly = require('bitly');
var bitly = new Bitly(config.bitly_user, config.bitly_apikey);

var d = domain.create();

d.on('error', function (err) {
  console.log("unexpected error");
  console.log(err);
});

// do rfc 4648 base64 "url safe"
var base64re1 = /\+/g;
var base64re2 = /\//g;

exports.saveSignature = function (req, res) {
  var url = req.body.urlInput;
  console.log("the url is: " + url);

  var callback = function (err, newItem) {
    console.log(err);
    if (err && err.code === 11000) {
      // duplicate key
      console.log("duplicate url: " + shortenedUrl);

      SIGNATURE.find({"signature.shortenedUrl" : shortenedUrl}, function(err, result) {
        if (err) throw err;
        console.log(result);

        res.json({
          successful: true,
          id: result[0].id
        });
      });

    } else if (err) {
      // epic fail
      res.json({
        successful: false
      });
      throw err;

    } else {
      // new url
      console.log("saved signature to mongodb");
      res.json({
       successful: true,
       id: newItem.id
      });
    }
  };

  if (url !== null && url !== undefined && validUrl.isUri(url)) {

    // an URL has to have at least three slashes in order for a fragment to be valid
    // the first two from http:_//_ and the last one after the hostname
    var slashCnt = (url.split("/").length - 1);
    if (slashCnt <= 2) {
      console.log("i had to append a trailing slash");
      url = url + '/';
    }

    var shorten = req.body.shorten;
    var shortenedUrl = url;

    if (shorten === "true") {
      console.log("the url should be shortened");
      bitly.shorten(url, function (err, response) {
        if (err) throw err;

        // See http://code.google.com/p/bitly-api/wiki/ApiDocumentation for format of returned object
        shortenedUrl = response.data.url;
        console.log("the shortened url is: " + shortenedUrl);

        saveUrlToDatabase(url, callback, shortenedUrl);
      });
    } else {
      saveUrlToDatabase(url, callback);
    }

  } else {
    res.json({successful: false});
  }
};

function saveUrlToDatabase(url, callback, shortenedUrl) {
  var newItem = new SIGNATURE();
  var date = new Date();
  var shasum = crypto.createHash('sha256');

  shasum.update(url);

  // means the client cant verify the checksum on its on
  // shasum.update(date.toISOString());

  // url safe base 64 encoding
  var base64 = shasum.digest('base64');
  base64 = base64.replace(base64re1, '-');
  base64 = base64.replace(base64re2, '_');

  newItem.signature.checksum = base64;
  newItem.signature.date = date;
  newItem.signature.url = url;
  newItem.signature.verified = false;

  if (shortenedUrl !== undefined) {
    newItem.signature.shortenedUrl = shortenedUrl || "";
    newItem.signature.shortened = true;
  } else {
    newItem.signature.shortenedUrl = url;
    newItem.signature.shortened = false;
  }

  console.log("the new signature is: " + newItem);

  newItem.save(callback);
}