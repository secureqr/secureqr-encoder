var db = require('../database');
var domain = require('domain');
var qr = require('qr-image');
var url = require('url');

var SIGNATURE = db.connection;

var d = domain.create();

d.on('error', function(err) {
    console.log("unexpected error");
    console.log(err);
});

var imageTypes = ["svg", "png", "eps", "pdf"];

exports.retrieve = function(req, res) {
    console.log("the retrieval id is: " + req.id);

    if (req.id !== null && req.id !== undefined) {
        SIGNATURE.findById(req.id, function(err, result) {
            if (err) throw err;

            var url = result.signature.url;
            var hash = result.signature.checksum;
            var imgType = req.imgType;
            console.log("the image type is: " + imgType);

            var shortenedUrl = result.signature.shortenedUrl;
            if(shortenedUrl !== null && shortenedUrl !== undefined && shortenedUrl !== "") {
              console.log("shortened url was present in database; using it to generate QR code");
              url = shortenedUrl;
            }

            if(imgType !== null && imageTypes.indexOf(imgType) !== -1) {
                var qrcode = qr.image(url + "#" + hash, { type: imgType });
                res.type(imgType);
            } else {
                // defaults to svg
                var qrcode = qr.image(url, { type: 'svg' });
                res.type('svg');
            }

            console.log("the url parameters are: " + req.query);
            if(req.query.dl !== undefined) {
                res.setHeader('Content-disposition', 'attachment; filename=QRcode.' + req.imgType);
            }

            qrcode.pipe(res);
        });
    } else {
        res.redirect("/");
    }
};

exports.verify = function(req, res) {
    var url = req.body.url;
    var hash = req.body.hash;

    console.log("the url is: " + url);
    console.log("the hash is: " + hash);

    SIGNATURE.find({"signature.url": url, "signature.checksum": hash, "signature.verified": true}, function(err, result) {
       if (err) throw err;
        console.log(result);

        if(result.length > 0) {
            res.json({successful: true, "date": result[0].signature.date.getTime(), "id": result[0].id});
        } else {
            res.json({successful: false, "date": null});
        }
    });
};

exports.sign = function(req, res) {
  var id = req.body.id;

  if (id !== undefined && id !== null) {
   SIGNATURE.findById(id, function(err, result) {
     if (err) throw err;

     if (result !== undefined) {
      result.signature.verified = true;
      result.save();
      res.json({successful: true});
     } else {
       res.json({successful: false});
     }
   });
  } else {
    res.json({successful: false});
  }
};

exports.revoke = function(req, res) {
  var id = req.body.id;

  if (id !== undefined && id !== null) {
    SIGNATURE.findById(id, function(err, result) {
      if (err) throw err;

      if (result !== undefined) {
        result.signature.verified = false;
        result.save();
        res.json({successful: true});
      } else {
        res.json({successful: false});
      }
    });
  } else {
    res.json({successful: false});
  }
};