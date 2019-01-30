'user strict';

// Load Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const indico = require('indico.io');
indico.apiKey = process.env.INDICO_API_KEY;
var Twitter = require('twitter');


// Load env vars;
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Twitter Client set up
var twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// PostgresQL setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// App setup, configure, and middlewares
const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.use(methodOverride(req => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body['_method'];
    delete req.body['_method'];
    return method;
  }
}));

app.set('view engine', 'ejs');

// ============================
// Routes
// ============================

app.get('/', home);


// ============================
// Route handlers
// ============================

function home(req, res) {
  res.render('pages/index');
  // var params = {
  //   screen_name: 'realDonaldTrump',
  //   trim_user: true,
  //   exclude_replies: true,
  //   include_rts: false,
  //   count: 20,
  //   tweet_mode: 'extended'
  // };
  // twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
  //   if (!error) {
  //     console.log(tweets);
  //     res.send(tweets);
  //   }
  // });
}

// ============================
// Helper functions
// ============================




// Error 404
app.get('/*', function(req, res) {
  res.status(404).render('pages/error', {
    message: 'This page does not exist',
    error: '404 Page Not Found',
  })
});

// Server error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).render('pages/error', {
    message: 'Server Error',
    error: err
  });
}

// App listening on PORT
app.listen(PORT, () => {
  console.log(`server is up on port : ${PORT}`);
});
