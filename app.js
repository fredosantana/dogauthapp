const express               = require('express'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      bodyParser            = require('body-parser'),
      User                  = require('./models/user'),
      localStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose');

const app = express();
mongoose.connect('mongodb://localhost/dogauth');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(require('express-session')({
  secret: 'This is a test',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =================
// LOG-IN ROUTES
// =================

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/'
  }), (req, res) => {
});

// =================
// LOG-OUT ROUTE
// =================

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// =================
// MIDDLEWARE TO ENSURE SECURITY
// =================

function isLoggedIn(res, req, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// =================
// SUCCESS ROUTE
// =================

app.get('/success', isLoggedIn, (req, res) => {
  res.render('success');
});

// =================
// ERROR ROUTE
// =================

app.get('/error', (req, res) => {
  res.render('error');
});

// =================
// AUTH ROUTES
// =================

// Sign up form
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // res.send('Post route works');
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
      console.log(err);
      return res.render('error');
    }
    passport.authenticate('local')(req,res,() => {
      return res.render('success');
      });
    });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("DogAuth Launched");
});
