const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const firebase = require('firebase-admin');
const hbs = engines.handlebars;

const firebaseApp = firebase.initializeApp(
  functions.config().firebase
)

// initialize app
const app = express();
app.engine( 'hbs' , hbs );
app.set( 'views' , './views' );
app.set( 'view engine' , 'hbs' );

function getDates() {
  const datesRef = firebaseApp.database().ref('Events');
  return datesRef.once('value').then(snap => snap.val());
}

function getSounds() {
  var soundsRef = firebase.database().ref("Soundboard");
  return soundsRef.once('value').then(snap => snap.val());
}

['/', '/index.html'].forEach(function(path) {
  app.get(path, (request, response) => {
    response.render('index', { partials : { navbar : './partials/navbar', footer : './partials/footer' , header : './partials/header'} });
  });
});

app.get('/dates.html', (request, response) => {
  getDates().then(dates => {
    for (let i = 0; i < dates.count; i++) {

      if (dates[i.toString()].timestamp <= Date.now()) { // remove events that have already happened
        delete dates[i.toString()];
      }
    }

    delete dates.count;

    response.render('dates', { dates, partials : { navbar : './partials/navbar', footer : './partials/footer' , header : './partials/header'} });
  })
});

app.get('/soundboard.html', (request, response) => {
  getSounds().then(soundboard => {
    json = JSON.stringify(soundboard);
    json = json.replace(/'/g, "%27"); // prevent problems with quote marks in strings

    sounds = soundboard.Sounds;
    tabs = soundboard.Tabs;

    for (let i=0; i < tabs.count; i++) {
      delete sounds[tabs[i]].count;
    }
    delete tabs.count

    response.render('soundboard', { json, sounds, partials : { navbar : './partials/navbar', footer : './partials/footer' , header : './partials/header'} });
  });
});

app.use(express.static('public'));

exports.app = functions.https.onRequest(app);