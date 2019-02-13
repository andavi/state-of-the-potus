'use strict';

// Load Dependencies
const express = require('express');
const cors = require('cors');
// const superagent = require('superagent');
const pg = require('pg');
const format = require('pg-format');
const methodOverride = require('method-override');
const indico = require('indico.io');
indico.apiKey = process.env.INDICO_API_KEY;
var Twitter = require('twitter');
// var Chart = require('chart.js');

const gradient = require('./dependencies/gradient');
const emotionColorMap = require('./dependencies/color-converter').emotionColorMap;
const politicalColorMap = require('./dependencies/color-converter').politicalColorMap;
const personalityColorMap = require('./dependencies/color-converter').personalityColorMap;


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
const pgClient = new pg.Client(process.env.DATABASE_URL);
pgClient.connect();
pgClient.on('error', err => console.error(err));

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
// This is a same route handler that won't make API calls
// For deployed version for now
// app.get('/', homeNoAPIs);

app.get('/', home);
app.get('/emotional', emotional);
app.get('/political', political);
app.get('/personality', personality);
app.get('/sentiment', sentiment);
app.get('/:id', details);


// ============================
// Route handlers
// ============================

function homeNoAPIs(req, res) {
  let SQL = 'SELECT * FROM tweets ORDER BY id DESC';
  pgClient.query(SQL)
    .then(result => {
      return res.render('pages/home/index', {
        tweets: result.rows.map(row => new Tweet(row)),
        emotionColorMap,
      });
    })
    .catch(err => handleError(err));
}

function home(req, res) {
  // check that we're  not adding repeats to the db
  const SQL = 'SELECT id FROM tweets;';
  pgClient.query(SQL)
    .then(result => {
      const repeatIds = result.rows.map(row => Number(row.id));

      var params = {
        screen_name: 'realDonaldTrump',
        trim_user: true,
        exclude_replies: false,
        include_rts: false,
        count: 5,
        tweet_mode: 'extended',
        // since_id: 1.09073103735588e+18
      };
      twitterClient.get('statuses/user_timeline', params)
        .then(tweets => {
          // console.log(tweets);
          // not keeping tweets that have links or are repeats
          const filteredTweets = tweets.filter(t => t.entities.urls.length === 0 && !repeatIds.includes(t.id));

          // if all tweets have been stored, retrieve them and render page
          if (filteredTweets.length === 0) {
            let SQL = 'SELECT * FROM tweets ORDER BY id DESC';
            pgClient.query(SQL)
              .then(result => {
                return res.render('pages/home/index', {
                  tweets: result.rows.map(row => new Tweet(row)),
                  barColorMap: emotionColorMap,
                });
              })
              .catch(err => handleError(err));

          // otherwise continue on to analyze and store the new ones
          } else {
            // replace the html ampersand code with an &
            const fullTexts = filteredTweets.map(t => t.full_text.replace(/&amp;/g, '&'));

            // get sentiment_hq
            indico.sentimentHQ(fullTexts)
              .then(sentimentArr => {

                // get emotions in second batch request
                indico.emotion(fullTexts)
                  .then(emotionsArr => {

                    // get political analysis next
                    indico.political(fullTexts)
                      .then(politicalArr => {

                        // then personality
                        indico.personality(fullTexts)
                          .then(personalityArr => {

                            // normalize the tweets to the information we want
                            const normalizedTweets = [];
                            for (let i in filteredTweets) {
                              const normTweet = new Row(
                                filteredTweets[i],
                                fullTexts[i],
                                sentimentArr[i],
                                emotionsArr[i],
                                politicalArr[i],
                                personalityArr[i]
                              )
                              normalizedTweets.push(normTweet);
                            }

                            // store in db
                            const valuesArr = normalizedTweets.map(t => {
                              return [t.id, t.created_at, t.full_text, t.sentiment, t.anger, t.fear, t.joy, t.sadness, t.surprise, t.libertarian, t.green, t.liberal, t.conservative, t.extraversion, t.openness, t.agreeableness, t.conscientiousness]
                            })
                            let SQL = format('INSERT INTO tweets (id, created_at, full_text, sentiment, anger, fear, joy, sadness, surprise, libertarian, green, liberal, conservative, extraversion, openness, agreeableness, conscientiousness) VALUES %L', valuesArr);

                            pgClient.query(SQL)
                              .then(result => {
                                console.log(result);

                                let SQL = 'SELECT * FROM tweets ORDER BY id DESC';
                                pgClient.query(SQL)
                                  .then(result => {
                                    return res.render('pages/home/index', {
                                      tweets: result.rows.map(row => new Tweet(row)),
                                      barColorMap: emotionColorMap,
                                    });
                                  })
                                  .catch(err => handleError(err));
                              })
                              .catch(err => handleError(err));
                          })
                          .catch(err => handleError(err));
                      })
                      .catch(err => handleError(err));
                  })
                  .catch(err => handleError(err));
              })
              .catch(err => handleError(err));
          }
        })
        .catch(err => handleError(err));
    })
    .catch(err => handleError(err));
}


function details(req, res) {
  const SQL = `SELECT * FROM tweets WHERE id=${req.params.id};`;
  pgClient.query(SQL)
    .then(result => {
      const tweet = new Tweet(result.rows[0]);
      return res.render('pages/details/show', {
        tweet,
        emotionColorMap,
        politicalColorMap,
        personalityColorMap
      });
    })
    .catch(err => handleError(err));
}

function emotional(req, res) {
  const SQL = 'SELECT * FROM tweets;';
  pgClient.query(SQL)
    .then(result => {
      const emotions = result.rows.map(row => new Tweet(row).emotion);
      return res.render('pages/emotional/show', {
        tweets: result.rows.map(row => new Tweet(row)),
        averages: getAverages(emotions),
        emotionColorMap
      });
    })
    .catch(err => handleError(err));
}

function political(req, res) {
  const SQL = 'SELECT * FROM tweets;';
  pgClient.query(SQL)
    .then(result => {
      const politicals = result.rows.map(row => new Tweet(row).political);
      return res.render('pages/political/show', {
        averages: getAverages(politicals),
        poliColorMap: politicalColorMap
      });
    })
    .catch(err => handleError(err));
}

function personality(req, res) {
  const SQL = 'SELECT * FROM tweets;';
  pgClient.query(SQL)
    .then(result => {
      const personalities = result.rows.map(row => new Tweet(row).personality);
      return res.render('pages/personality/show', {
        averages: getAverages(personalities),
        personalityColorMap,


      });
    })
    .catch(err => handleError(err));
}

function sentiment(req, res) {
  const SQL = 'SELECT * FROM tweets ORDER BY created_at DESC;';
  pgClient.query(SQL)
    .then(result => {
      const tweets = result.rows.map(row => new Tweet(row));
      return res.render('pages/sentiment/show', {
        tweets,
        sentimentColor: emotionColorMap.sentiment,
        sentimentBarGradient: gradient('rgba(255,0,0,1)', 'rgba(0,0,255,1)', 100, 0.4),
        sentBandsTotals: getDivisions(0.01, tweets.map(t => t.sentiment)).sentBandsTotals,
        sentBandsLabels: getDivisions(0.01, tweets.map(t => t.sentiment)).sentBandsLabels,
        sentLineAreaTotals: getDivisions(0.05, tweets.map(t => t.sentiment)).sentBandsTotals,
        sentLineAreaLabels: getDivisions(0.05, tweets.map(t => t.sentiment)).sentBandsLabels,
      });
    })
    .catch(err => handleError(err));
}


// ============================
// Constructors
// ============================
// normalize data for db insertion
function Row(tweet, full_text, sentiment, emotions, political, personality) {
  this.created_at = tweet.created_at;
  this.id = tweet.id;
  this.full_text = full_text;
  this.sentiment = sentiment;
  this.anger = emotions.anger;
  this.fear = emotions.fear;
  this.joy = emotions.joy;
  this.sadness = emotions.sadness;
  this.surprise = emotions.surprise;
  this.libertarian = political.Libertarian;
  this.green = political.Green;
  this.liberal = political.Liberal;
  this.conservative = political.Conservative;
  this.extraversion = personality.extraversion;
  this.openness = personality.openness;
  this.agreeableness = personality.agreeableness;
  this.conscientiousness = personality.conscientiousness;
}

// normalize data on db extraction
function Tweet(row) {
  this.created_at = row.created_at;
  this.id = row.id;
  this.full_text = row.full_text;
  this.sentiment = row.sentiment;
  this.emotion = {
    anger: row.anger,
    fear: row.fear,
    joy: row.joy,
    sadness: row.sadness,
    surprise: row.surprise
  }
  this.dominantEmotion = getDominantTrait(this.emotion);
  this.political = {
    libertarian: row.libertarian,
    green: row.green,
    liberal: row.liberal,
    conservative: row.conservative
  }
  this.dominantPolitical = getDominantTrait(this.political);
  this.personality = {
    extraversion: row.extraversion,
    openness: row.openness,
    agreeableness: row.agreeableness,
    conscientiousness: row.conscientiousness
  }
  this.dominantPersonality = getDominantTrait(this.personality);
}

// ============================
// Helper Functions
// ============================

function getDominantTrait(traitObj) {
  return Object.entries(traitObj).sort((a, b) => b[1] - a[1])[0][0];
}

function getAverages(traitGroups) {
  const total = traitGroups.length;
  const traits = Object.keys(traitGroups[0]);
  const traitsTotals = traitGroups.reduce((acc, group) => {
    traits.forEach(trait => {
      acc[trait] += group[trait];
    });
    return acc;
  });
  Object.keys(traitsTotals).forEach(trait => {
    traitsTotals[trait] /= total;
  });
  return traitsTotals;
}

// function counting number of tweets within n-width bands
function getDivisions(n, sentiments) {
  // const sentiments = tweets.sentiments;
  const sentBandsTotals = [];
  const sentBandsLabels = [];
  let start = 0;
  let end = n;
  while (end <= 1.0001) {
    const sentsPerBand = sentiments.reduce((a, s) => {
      a += s >= start && s < end ? 1 : 0;
      return a;
    }, 0);
    sentBandsTotals.push(sentsPerBand);
    sentBandsLabels.push(`[${start.toFixed(2)}, ${end.toFixed(2)})`);
    start += n;
    end += n;
  }
  return {sentBandsTotals, sentBandsLabels};
}




// ============================
// Error handlers
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


// ============================
// Listener
// ============================
// App listening on PORT
app.listen(PORT, () => {
  console.log(`server is up on port : ${PORT}`);
});
