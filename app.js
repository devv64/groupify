import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
import session from 'express-session';
const __filename = fileURLToPath(import.meta.url);
const __dirname =   dirname(__filename);

import * as userData from './data/users.js';

// import * as debug from './debug.js';

const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    next();
}

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({ 
  defaultLayout: 'main',
  helpers: {
    eq: function (a, b) { return a === b; },
  }
 }));
app.set('view engine', 'handlebars');

//cookie for getting current user
app.use( 
  session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    saveUninitialized: false,
    resave: false
  })
);


app.use('/', async (req, res, next) => {
  console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.user ? 'Authenticated' : 'Non-Authenticated User'})]`)

  if (req.session.user) {
    req.session.user = await userData.getUserById(req.session.user._id);
  }

  if (!req.session.user && req.path !== '/login' && req.path !== '/register' && req.path !== '/home') {
    return res.redirect('/login');
  }

  if (req.session.user && (req.path === '/login' || req.path === '/register' || req.path === '/home')) {
    return res.redirect('/feed');
  }

  if (req.path === '/') {
    if (req.session.user) {
      return res.redirect('/feed');
    } else {
      return res.redirect('/home');
    }
  }

  next();
});

app.use('/notifications', (req, res, next) => {
    return res.render('notifications', { 
      username: req.session.user.username,
      notifications: req.session.user.notifications,
    });
  });

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

// debug.test();