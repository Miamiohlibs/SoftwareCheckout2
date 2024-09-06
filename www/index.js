const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const fetch = require('node-fetch');
require('./auth');
const config = require('../config/appConf');

const app = express();
const port = 3010;

// Session configuration
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['authorization'];
  if (apiKey && apiKey === `Bearer ${config.admin.apiKey}`) {
    return next();
  } else {
    res.status(401).json({
      message: 'Unauthorized',
      key: apiKey,
      config: config.admin.apiKey,
    });
  }
}

// View and static files setup
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routes
let apiRouter = require('./routes/api');

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
  }),
  (req, res) => {
    res.redirect('/main');
  }
);

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate');
});

app.get('/main', isLoggedIn, async (req, res) => {
  try {
    let data = await fetch(`http://localhost:${port}/api/groups`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    let json = await data.json();
    res.render('main', { data: json });
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

app.get('/compare', isLoggedIn, async (req, res) => {
  try {
    let data = await fetch(
      `http://localhost:${port}/api/${req.query.vendor}/compare?group=${req.query.group}&cid=${req.query.cid}`,
      { headers: { Authorization: `Bearer ${config.admin.apiKey}` } }
    );
    let json = await data.json();
    res.render('compare', {
      data: json,
      vendor: req.query.vendor,
      group: req.query.group,
      groupName: req.query.groupName,
      cid: req.query.cid,
    });
  } catch (err) {
    res.status(500).send('Error fetching comparison data');
  }
});

// app.get('/logout', (req, res) => {
//   req.logout();
//   req.session.destroy();
//   res.redirect('/');
// });

app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });
});

// API routes
app.use('/api', apiKeyAuth, apiRouter);

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
