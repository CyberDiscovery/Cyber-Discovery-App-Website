let playing = false;

soundboard_data = JSON.parse(json.replace(/%27/g, "'"));

let sounds = soundboard_data.Sounds;
let tabs = soundboard_data.Tabs;

var soundboard = soundboard || {};
soundboard.main = (function(window,document) {

  var _sounds = [];
  var _instances = {};

  var _saveSounds = function() {
   $('.sound').each(function() {

      var name = $(this).text().trim();

      // set the variable sound equal to the object with the same name as the text of the div
      for (let i = 0; i< tabs.count; i++) {
        tab = tabs[i];
        for (let j = 0; j < sounds[tab].count; j++) {
          if (sounds[tab][j].name.trim() == name) {
            sound = sounds[tab][j];
          }
        }
      }

      createjs.Sound.registerSound(sound.link,sound.name);
    });
  };

  var _bindClicks = function() {
    $('.sound').on('click', function() {

      var $this = $(this);
      var name = $this.text().trim();

      if (!playing){
        playing = true;
        createjs.Sound.play(name).addEventListener('complete', createjs.proxy(function() {
          playing = false;
        }, this));;
      }

    });
  }

  var self = {
    init: function() {
      _saveSounds();
      _bindClicks();
    }

  }

  return self;
})(this,this.document);

$(document).ready(function() {
  soundboard.main.init();
});