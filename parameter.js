/**
 * Created by Thomas on 02.04.14.
 */

exports.id = function(req, res, next, id) {
    req.id = id;
    next();
};

exports.imgType = function(req, res, next, imgType) {
    req.imgType = imgType;
    next();
};
