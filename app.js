var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db = require('./configure/connection')
const session = require('express-session');
const MongoStore = require('connect-mongo');
var adminHelper = require("./helpers/admin-helper")
const collections = require("./configure/collections")
const cron = require('node-cron');
const commonHelper = require('./helpers/common-helpers')

var adminRouter = require('./routes/admin');
var membersRouter = require('./routes/members');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutDir: __dirname + '/views/layout/', partialDir: __dirname + "/views/partials/" }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



db.connect((err) => {
  if (err) console.log("error" + err);
  else {
    console.log("database connected");
    adminHelper.createAdminCollection()
  }
})

app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 90 },
  store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017" })
}))



app.use('/', membersRouter);
app.use('/admin', adminRouter);


//automatically update weekly deposits

cron.schedule('5 * * * * Mon', () => {
commonHelper.updateWeeklyAmount().then((data)=>{
  console.log("weekly amount updated")

})
}, {
  timezone: 'Asia/Calcutta'
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
