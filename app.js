
/**
 * Module dependencies.
 */

var express = require('express'),
    parseCookie = require('connect').utils.parseCookie,
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();
    routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // use session
  app.use(express.cookieParser());
  app.use(express.session({ 
    secret: 'your secret here',
    store: sessionStore
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

// index.html
app.get('/', function(req, res) {
  res.sendfile('public/html/index.html');
});

// create session
app.get('/admin', function(req, res) {
  req.session.admin = true;
  res.redirect('/');
});

// Socket.IO
var io = require('socket.io').listen(app);
// set express session to socket
io.set('authorization', function(handshakeData, callback) {
  if (handshakeData.headers.cookie) {
    var cookie = handshakeData.headers.cookie;
    var sessionId = parseCookie(cookie)['connect.sid'];
    sessionStore.get(sessionId, function(err, session) {
      if (err) {
        callback(null, false);
      } else {
        handshakeData.session = session;
        callback(null, true);
      }
    });
  } else {
    return callback(null, true);
  }
});
io.on('connection', function(socket) {
  socket.on('move', function(data) {
    console.log(socket.handshake.session);
    if (!socket.handshake.session) {
      return false;
    }
    if (!socket.handshake.session.admin) {
      return false;
    }
    console.log("move");
    socket.broadcast.emit('move', data);
  });
  socket.on('disconnect', function() {
    // do nothing
  });
});

var port = process.env.PORT || 3000; 
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
