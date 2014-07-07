var db = require('../database');
var config = require('../config');
var SIGNATURE = db.connection;
var domain = require('domain');
var d = domain.create();

d.on('error', function (err) {
  console.log("unexpected error");
  console.log(err);
});

exports.listAll = function(req, res) {
  SIGNATURE.find({}).sort({"signature.date":-1}).limit(config.listLimit).exec(function(err, docs) {
    if(err) throw err;
    res.json(docs);
  });
}

exports.search = function(req, res) {
  var url = req.query.url;
  console.log("the url to search for is: \"" + url + "\"");

  if(url !== undefined && url !== null && url !== "") {
    SIGNATURE.find({"signature.url" : { $regex: '.*' + url + '.*', $options: 'i'}}).sort({"signature.date":-1}).exec(function(err, docs) {
      if(err) throw err;
      res.json(docs);
    });
  } else {
    res.json({});
  }
}

exports.listUnsigned = function(req, res) {
  SIGNATURE.find({$or: [{"signature.verified": false}, {"signature.verified": undefined}]}).sort({"signature.date":-1}).exec(function(err, docs) {
    if(err) throw err;
    res.json(docs);
  });
}

exports.listSigned = function(req, res) {
  SIGNATURE.find({"signature.verified": true}).sort({"signature.date":-1}).exec(function(err, docs) {
    if(err) throw err;
    res.json(docs);
  });
}