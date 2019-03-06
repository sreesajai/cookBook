
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const debug = require('debug')('loopback:authentication');
const {ensureLoggedIn} = require('connect-ensure-login');
const path = require('path');
const session = require('express-session');


module.exports = (app) => {
  debug('Enabling Web interface');

  // Setup the view engine (jade)
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  /*
   * body-parser is a piece of express middleware that
   *   reads a form's input and stores it as a javascript
   *   object accessible through `req.body`
   */

  // to support JSON-encoded bodies
  app.middleware('parse', bodyParser.json());
  // to support URL-encoded bodies
  app.middleware('parse', bodyParser.urlencoded({
    extended: true,
  }));

  /*const cookieSecret = process.env.COOKIE_SECRET ||
    '246bace2-38cb-4138-85d9-0ae8160b07c8';
  app.middleware('session:before', cookieParser(cookieSecret));*/

  const sessionSecret = process.env.SESSION_SECRET || 'kitty';
  app.middleware('session', session({
    secret: sessionSecret,
    saveUninitialized: true,
    resave: true,
  }));


  app.get('/', (req, res) => {
    res.render('pages/index', {user:
      req.user,
      url: req.url,
    });
  });

  app.get('/auth/account', ensureLoggedIn('/login'), (req, res) => {
    //res.send('<html><head></head><body>Log in Successful</body></html>');
    res.render('pages/loginProfiles', {
      user: req.user,
      url: req.url,
    });
  });

  app.get('/local', (req, res) => {
    res.render('pages/local', {
      user: req.user,
      url: req.url,
    });
  });

  app.get('/ldap', (req, res) => {
    res.render('pages/ldap', {
      user: req.user,
      url: req.url,
    });
  });

  app.get('/signup', (req, res) => {
    res.render('pages/signup', {
      user: req.user,
      url: req.url,
    });
  });

  app.post('/signup', (req, res) => {
    const User = app.models.user;

    const newUser = {};
    newUser.email = req.body.email.toLowerCase();
    newUser.password = req.body.password;
    newUser.emailVerified = (!(app.get('emailVerificationRequired')));

    User.create(newUser, (err, user) => {
      if (err) {
        req.flash('error', err.message);
        res.redirect('back');
        return;
      }
      // Passport exposes a login() function on req (also aliased as logIn())
      // that can be used to establish a login session. This function is
      // primarily used when users sign up, during which req.login() can
      // be invoked to log in the newly registered user.
      req.login(user, (loginErr) => {
        if (loginErr) {
          req.flash('error', loginErr.message);
          return res.redirect('back');
        }
        return res.redirect('/auth/account');
      });
    });
  });

  app.get('/login', (req, res) => {
    res.render('pages/login', {
      user: req.user,
      url: req.url,
    });
  });

  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/google/fail', (req, res) => {
    console.log('AM HERE');
    res.send(req);
  });
};