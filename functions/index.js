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

function getSchedules() {
  const schedulesRef = firebase.database().ref("Schedule");
  return schedulesRef.once('value').then(snap => snap.val());
}

function timestamp_to_time(timestamp) {
  let date = new Date(timestamp); 
  let options = {timeZone: "Europe/London", hour12: false}
  let output = date.toLocaleTimeString('en-GB' , options).substring(0,5);
  return output;
}

function timestamp_to_date(timestamp) {
  let date = new Date(timestamp); 
  let options = {timeZone: "Europe/London", hour12: false, month: "long", day:"numeric", minute: "2-digit", hour: "2-digit"}
  let output = date.toLocaleString('en-GB' , options)
  return output;
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

app.get('/schedule.html', (request, response) => {

  getSchedules().then(schedule => { 
    
    let schedules = {};
    let tabs = schedule['Tabs']; 
    
    for (let i = 0; i < tabs.count; i++ ) {

      let tab_name = tabs[i];
      let reg_expr = /[^a-zA-Z0-9-_]/g;
      
      schedules[tab_name] = {};
      schedules[tab_name] = schedule['Schedules'][tab_name]; // add schedules to object so they are in the right order for the template
      
      schedules[tab_name]['name_id'] = tab_name.replace(reg_expr, ""); // remove spaces
      
      schedules[tab_name]['startTime'] = timestamp_to_date(schedules[tab_name]['startTimestamp']).substring(0,16);
      schedules[tab_name]['endTime'] = timestamp_to_date(schedules[tab_name]['endTimestamp']).substring(0, 16);
      
      if (schedules[tab_name]['released'] == true) {

        for (let j = 0; j < schedules[tab_name]['activities']['count']; j++) {
          schedules[tab_name]['activities'][j]['startTime'] = timestamp_to_time(schedules[tab_name]['activities'][j]['startTimestamp']);
          schedules[tab_name]['activities'][j]['endTime'] = timestamp_to_time(schedules[tab_name]['activities'][j]['endTimestamp']);
        }

      } else {
        delete schedules[tab_name]['released']; // used in handlebars templated to check if released yet
      }
    
      delete schedules[tab_name]['activities']['count']; // remove the count for each event
    }
    
    delete tabs.count;
    response.render('schedule', { schedules, tabs, partials : { navbar : './partials/navbar', footer : './partials/footer' , header : './partials/header'} });
  
  });

});

app.get('/soundboard.html', (request, response) => {
  getSounds().then(soundboard => {
    let json = JSON.stringify(soundboard);
    json = json.replace(/'/g, "%27"); // prevent problems with quote marks in strings

    let sounds = soundboard.Sounds;
    let tabs = soundboard.Tabs;

    for (let i=0; i < tabs.count; i++) {
      delete sounds[tabs[i]].count;
    }
    delete tabs.count

    response.render('soundboard', { json, sounds, partials : { navbar : './partials/navbar', footer : './partials/footer' , header : './partials/header'} });
  });
});

app.use(express.static('public'));

exports.app = functions.https.onRequest(app);