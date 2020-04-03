// Using express: http://expressjs.com/
var express = require('express');

// Init App
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var helmet = require('helmet');
//var assert = require('assert');

// csurf middleware to mitigate CSRF
// var csrf = require('csurf');

// File System for loading the list of words
var fs = require('fs');

// Cors for allowing "cross origin resources"
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
// var cors = require('cors');
// app.use(cors());

// Helmet Middleware to secure HTTP headers
app.use(helmet());
app.disable('x-powered-by');

//var dbUrl = 'mongodb://test:testPassword2017@ds141351.mlab.com:41351/mlab-db';
// var dbUrl = 'mongodb://localhost/fleetmanagement';
var dbUrl = 'mongodb+srv://admin:admin123@finale-weqiy.mongodb.net/test?retryWrites=true&w=majority'

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: 5, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};
// mongoose.connect(dbUrl, { useNewUrlParser: true }).
//   then(error => handleError(error));
mongoose.connect(dbUrl, options).then(
  () => {
    console.log("Connected to database.")
  },
  err => {
    console.err("Error connecting to database:");
    console.log(err);
  }
);

// mongoose.coonnection.close();

var routes = require('./routes/index');
var usersRoute = require('./routes/usersRoute');
var driversRoute = require('./routes/driversRoute');
var vehiclesRoute = require('./routes/vehiclesRoute');
var reportsRoute = require('./routes/reportsRoute');
var liveRoute = require('./routes/liveRoute');
var contactRoute = require('./routes/contactRoute');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
  defaultLayout: 'layout',
  helpers: {
    inc: function (value, options) {
      return parseInt(value) + 1;
    },
    json: function (content) {
      return JSON.stringify(content);
    },
    ifDate: function (value, options) {
      // console.log(Date(value) + ">" + new Date());
      var x = new Date(value);
      var y = new Date();
      x1 = +x; // convert to number
      y1 = +y;
      var threshold = 1200000000; // two weeks alert
      if (x1 < y1) {
        return "Expired";
      } else if (+x == +y) {
        return "Expires today";
      } else if ((x1 - y1) < threshold) {
        return "Expires";
      }
    },
    reverse: function (value, options) {
      value.reverse();
    },
    convertTime: function (value, options) {
      d = new Date(value);
      return d.toLocaleTimeString();
    },
    convertDate: function (value, options) {
      d = new Date(value);
      dM = d.getMonth();
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[dM] + " " + d.getDate() + ", " + d.getFullYear();
    }
  }
}));
app.set('view engine', 'handlebars');

/**
 *    BodyParser Middleware
 * body-parser extracts the entire body portion of an incoming request 
 * stream and exposes it on req.body
 * Also, protects against HTTP parameter solution — called hpp 
 * It identifies any repeated parameters and only passes the last specified value.
 * 
 * urlencoded() and json() are actually middleware factories that returns
 * a middleware function which invokes next()
 * 
 *  */

// Parses the text as JSON and exposes the resulting object on req.body
app.use(bodyParser.json());

// Parses application/x-www-form-urlencoded
// The value can be a string or array (when extended is false), 
// or any type (when extended is true).
var parseForm = bodyParser.urlencoded({ extended: false });
app.use(parseForm);

app.use(cookieParser());

// Cross-Site Request Forgery - after bodyParser and cookieParser
// var csrfProtection = module.exports = csrf({ cookie: true });
// app.use(csrfProtection);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//   Session
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
  secret: 'rand0ms3cr3tSession',
  saveUninitialized: true,
  resave: false,
  cookie: {
    httpOnly: true,   // flags the cookie to be accessible only by the web server 
    expires: expiryDate,
    secure: false   // marks the cookie to be used with HTTPS only (defaults to false)
  }
}));
// TODO: make cookie secure in production

// Express Validator
app.use(expressValidator());
// const { check, validationResult } = require('express-validator');
// router.post('/finished', function (req, res) {
// let email = req.body.email
// check('email', 'Email required').isEmail()
// var errors = validationResult(req)
// if (errors) {
//   req.session.errors = errors
//   req.session.success = false
//   res.redirect('/email-adress')
//   } else {
//   req.session.success = true
//   res.redirect('/finished')
//   }
// })

// Passport init
app.use(passport.initialize());
app.use(passport.session());
// passport.session() supports persistent login sessions (recommended)
// RememberMeStrategy = require('../..').Strategy;
// app.use(passport.authenticate('remember-me'));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.user || null;
  // res.cookie('XSRF-TOKEN', req.csrfToken());
  // res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/', routes);
app.use('/users', usersRoute);
app.use('/drivers', driversRoute);
app.use('/vehicles', vehiclesRoute);
app.use('/reports', reportsRoute);
app.use('/live', liveRoute);
app.use('/contact', contactRoute);

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// if (process.env.OS == 'Windows_NT') {
//   require('child_process').spawn('explorer', ['http://localhost:3000']);
// }

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Application started at http://' + host + ':' + port);
}
