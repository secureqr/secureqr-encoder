
/**
 * Module dependencies.
 */

var express   = require('express');
var http      = require('http');
var path      = require('path');
var user      = require('./routes/user');
var encode    = require('./routes/encode');
var list      = require('./routes/list');
var qr        = require('./routes/qr');
var database  = require('./database');
var parameter = require('./parameter');
var config = require('./config');

var app = express();

var cacheTime = config.cacheTime;

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon("public/images/favicon.png"));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.compress());
app.use(app.router);
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: cacheTime }));
app.use(express.directory(path.join(__dirname, 'public')));

app.set('json spaces', 0);

app.param('id', parameter.id);
app.param('imgType', parameter.imgType);

var auth = express.basicAuth(config.adminUser, config.adminPassword);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/list', list.listAll);
app.get('/search', list.search);
app.get('/qr/:imgType/:id', qr.retrieve);

app.post('/encode', encode.saveSignature);
app.post('/verify', qr.verify);

app.get('/admin/listUnsigned', list.listUnsigned);
app.get('/admin/listSigned', list.listSigned);
app.post('/admin/sign', auth, qr.sign);
app.post('/admin/revoke', auth, qr.revoke);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
