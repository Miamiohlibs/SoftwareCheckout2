const path = require('path');
const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const fetch = require('node-fetch');
const sslRootCAs = require('ssl-root-cas');
sslRootCAs.inject();
require('./auth');
const config = require('../config/appConf');
const port = config.admin.port || 3010;
let logger = require('../services/logger');

logger.info('starting admin web console');
const app = express();

global.onServer =
  config.hasOwnProperty('admin') &&
  config.admin.hasOwnProperty('onServer') &&
  config.admin.onServer === true;

let protocol = 'http';
const hostname = config.admin.hostname;
if (global.onServer) {
  protocol = 'https';
}

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

// apply theme color to navbar from config
app.use((req, res, next) => {
  if (config.admin.navbarTheme) {
    res.locals.navbarBackground =
      config.admin.navbarTheme.backgroundColor || 'bg-primary';
    res.locals.navbarTextColor =
      config.admin.navbarTheme.textColor || 'navbar-dark';
    next();
  } else {
    res.locals.navbarBackground = 'bg-primary';
    res.locals.navbarTextColor = 'navbar-dark';
    next();
  }
});

function isPermittedUser(req) {
  if (!req.user) {
    return false;
  }
  return config.admin.allowedUsers.includes(req.user.email);
}
function isLoggedIn(req, res, next) {
  if (config.admin.requireLogin) {
    return req.isAuthenticated() && isPermittedUser(req)
      ? next()
      : res.redirect('/?error=unauthorized');
  }
  return next();
  // req.user ? next() : res.sendStatus(401);
}

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['authorization'];
  if (apiKey && apiKey === `Bearer ${config.admin.apiKey}`) {
    return next();
  } else {
    res.status(401).json({
      message: 'Unauthorized',
      key: apiKey,
      // config: config.admin.apiKey,
    });
  }
}

// View and static files setup
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routes
let apiRouter = require('./routes/api');
app.use('/api', apiKeyAuth, apiRouter);
let logsRouter = require('./routes/logs');
app.use('/logs', isLoggedIn, logsRouter);
let statsRouter = require('./routes/stats');
const { error } = require('console');
app.use('/stats', isLoggedIn, statsRouter);

app.set('json spaces', 2);

app.get('/', (req, res) => {
  if (config.admin.requireLogin & !isPermittedUser(req)) {
    res.render('landing', { error: req.query.error });
  } else {
    res.redirect('/systemStatus');
  }
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
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.displayName,
    };
    res.redirect('/systemStatus');
  }
);

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate');
});

app.get('/systemStatus', isLoggedIn, async (req, res) => {
  try {
    let data = await fetch(
      `${protocol}://${config.admin.hostname}:${port}/api/groups`,
      {
        headers: { Authorization: `Bearer ${config.admin.apiKey}` },
      }
    );
    let json = await data.json();
    res.render('systemStatus', { data: json, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching data: ' + JSON.stringify(err));
  }
});

app.get('/compare', isLoggedIn, async (req, res) => {
  let url = `${protocol}://${hostname}:${port}/api/${req.query.vendor}/compare?group=${req.query.group}&cid=${req.query.cid}`;
  try {
    let response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    let json = await response.json();
    if (!response.ok) {
      res.status(response.status).render('error', {
        message: json.error || 'Error fetching data',
        error: response.statusText,
        errorNumber: response.status,
      });
      return;
    }

    res.render('compare', {
      data: json,
      vendor: req.query.vendor,
      group: req.query.group,
      groupName: req.query.groupName,
      cid: req.query.cid,
      user: req.user || false,
    });
  } catch (err) {
    res.status(500).render('error', {
      message: 'Error fetching comparison data',
      error: 'Unknown error',
      errorNumber: 500,
    });
  }
});

app.get('/fetch', isLoggedIn, async (req, res) => {
  try {
    let response = await fetch(
      `${protocol}://${hostname}:${port}/api/${req.query.vendor}?group=${req.query.group}`,
      { headers: { Authorization: `Bearer ${config.admin.apiKey}` } }
    );
    let json = await response.json();
    if (!response.ok) {
      res.status(response.status).render('error', {
        message: json.error || json.message || 'Error fetching data',
        error: response.statusText,
        errorNumber: response.status,
      });
      return;
    }

    // res.json(json);
    res.render('vendorGroup', {
      data: json,
      vendor: req.query.vendor,
      group: req.query.group,
      groupName: req.query.groupName,
      user: req.user || false,
    });
    // res.render('fetch', { data: json, vendor: req.query.vendor, cid: req.query.cid });
  } catch (err) {
    res.status(500).render('error', {
      message: 'Error fetching data',
      error: err.message || 'Unknown error',
      errorNumber: 500,
    });
  }
});

app.get('/future', isLoggedIn, async (req, res) => {
  try {
    let response = await fetch(
      `${protocol}://${hostname}:${port}/api/libcal/future/${req.query.group}`,
      { headers: { Authorization: `Bearer ${config.admin.apiKey}` } }
    );
    let json = await response.json();
    if (!response.ok) {
      res.status(response.status).render('error', {
        message: json.error || 'Error fetching data',
        error: response.statusText,
        errorNumber: response.status,
      });
      return;
    }

    res.render('vendorGroup', {
      data: json,
      vendor: req.query.vendor,
      group: req.query.group,
      groupName: `Future Requests for ${req.query.groupName}`,
      user: req.user || false,
    });
  } catch (err) {
    console.log('what went wrong', err);
    res.status(500).render('error', {
      message: 'Error fetching data',
      error: err.message || 'Unknown error',
      errorNumber: 500,
    });
  }
});

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

app.get('*', function (req, res) {
  res.status(404).render('error', {
    message: 'Page not found',
    error: '404',
    errorNumber: 404,
  });
});

// Start server
if (global.onServer === true) {
  const server = config.admin.server;

  https
    .createServer(
      {
        key: fs.readFileSync(server.key),
        cert: fs.readFileSync(server.cert),
      },
      app
    )
    .listen(port, function () {
      console.log(
        `Server app listening on port ${port}! Go to https://${hostname}:${port}/`
      );
    });
} else {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
