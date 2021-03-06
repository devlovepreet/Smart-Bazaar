var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
//body-parser will take request from user or you and parses it to the form that is required by the server such as get or post
//body-parser cannot handle multi-part data like image or video uploads
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
//MongoStore is specifically to store session on server side
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

//importing secret file from config folder
var secret = require('./config/secret');
//importing user file from models folder
var User = require('./models/user');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');

var app = express(); // object of express
//dbuser:dbpassword
mongoose.connect(secret.database,function(err){
  if(err){
    console.log(err);
  }else{
    console.log("Connected to the database");
  }
});

//Middleware
app.use(express.static(__dirname+'/public'));
app.use(morgan('dev')); //object of morgan
app.use(bodyParser.json()); // now our express application can parse json data also
app.use(bodyParser.urlencoded({extended:true}));// now our express application can parse x-www-form-urlencoded data also
app.use(cookieParser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:secret.secretKey,
  store:new MongoStore({url:secret.database,autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// with the below function user data becomes accessible on all pages
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

app.use(cartLength);

// with the below function category data becomes accessible on all pages
app.use(function(req,res,next){
  //find all categories
  Category.find({},function(err,categories){
    if(err) return next(err);
    res.locals.categories = categories;
    next();
  });
});


app.engine('ejs',engine);
app.set('view engine','ejs'); // setting ejs as engine for our webpages

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use('/admin',adminRoutes);
app.use('/api',apiRoutes);

//we can also write app.use('/batman',mainRoutes) but them the links would become 'batman/' and 'batman/about'


//this function is for starting the server
//3000 is the port no
//listen will work fine even without function(err)
app.listen(secret.port,function(err){
  if(err) throw err;
  console.log("Server is Running on port "+secret.port);
});
