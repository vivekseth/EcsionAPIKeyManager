//----------//Start Template//----------//
/**
 * Module dependencies.
 */

var everyauth = require('everyauth-express3');

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('mr ripley'));
  app.use(express.session());
  app.use(everyauth.middleware(app));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});






app.get('/authenticate', routes.authenticate); //home where login screens
app.get('/', routes.home);
app.get('/login', routes.login);
//app.get('/login', routes.login);

//test

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
