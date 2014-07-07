/**
 * Created by thomasrieder on 27.03.14.
 */
var mongoose = require('mongoose'),
    config   = require('./config');

var Schema = mongoose.Schema;
var schema = new Schema({
  signature: {
    url: { type: [String], index: true },
    shortenedUrl: { type: [String], index: { unique: true }},
    checksum: String,
    date: Date,
    verified: Boolean,
    shortened: Boolean
  }
});

mongoose.connect('localhost', 'signatures');

var SIGNATURE = mongoose.model('signature', schema);
exports.connection = SIGNATURE;

mongoose.connection.on('open', function() {
  console.log('connected to mongodb');

  // clear database
  if (config.clear_database_on_startup) {
    try {
      console.log('clearing database');
      SIGNATURE.remove(function (err) {
        if (err) throw err;
      });
    } catch(err) {
      console.log('error connecting to database');
      console.log(err);
    }
  }
});