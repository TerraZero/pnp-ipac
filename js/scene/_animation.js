var Animation = {

  definitions: {},

  current: {
    videos: {},
  },

  on: {

    playerReady: function(event, video, name) {
      console.log('player ready', name);
    },

    playerStateChange: function(event, video, name) {
      console.log('player state change', name);
    },

    transitionend_videos: function(key) {

    },

    transitionend_images: function(key) {
      var first = Animation.data.background.images.first;
      var second = Animation.data.background.images.second;

      switch (key) {
        case 'first':
          break;
        case 'second':
          if (second.classes.stage__image__show) {
            first.classes.stage__image__transition = false;
            first.classes.stage__image__show = false;
            first.src = null;
          } else {
            second.src = null;
          }
          break;
      }
    },

    load_images: function(key) {
      var first = Animation.data.background.images.first;
      var second = Animation.data.background.images.second;

      switch (key) {
        case 'first':
          first.classes.stage__image__transition = !second.classes.stage__image__show;
          first.classes.stage__image__show = true;
          second.classes.stage__image__show = false;
          break;
        case 'second':
          second.classes.stage__image__transition = true;
          second.classes.stage__image__show = true;
          break;
      }
    },

  },

  setBackgroundImage: function(src) {
    var isFirst = Animation.data.background.images.first.src === null;
    var isSecond = Animation.data.background.images.second.src === null;

    if (isFirst) {
      Animation.data.background.images.first.src = src;
    } else if (isSecond) {
      Animation.data.background.images.second.src = src;
    }
  },

  setBackgroundVideo: function(video) {
    videos.v_background.player.loadVideoById(video.id);
  },

};
