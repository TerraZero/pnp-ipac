var Animation = {

  update: function(media) {
    switch (media.type) {
      case 'image':
        Animation.setBackgroundImage(media.image);
        break;
      case 'video':
        Animation.setVideo(media);
        break;
      case 'text':
        Animation.setText(media);
        break;
    }
  },

  videos: {},

  on: {

    playerReady: function(event, video, name) {

    },

    playerStateChange: function(event, video, name) {
      if (name === 'v_background' && event.data == YT.PlayerState.PLAYING) {
        Animation.data.background.images.first.classes.stage__image__show = false;
        Animation.data.background.images.second.classes.stage__image__show = false;
      }

      if (event.data == YT.PlayerState.ENDED) {

        var media = Animation.videos[name];

        if (media.shuffle) {
          var current_index = media.index;

          media.index = getRandom(0, media.videos.length - 1);
          if (media.index === current_index) {
            media.index = (media.index + 1) % media.videos.length;
          }

          Animation.setVideo(media);
          return;
        }

        if (media.videos[media.index + 1] === undefined && media.repeat) {
          media.index = 0;
          Animation.setVideo(media);
          return;
        }

        if (media.videos[media.index + 1] !== undefined) {
          media.index++;
          Animation.setVideo(media);
          return;
        }
      }
    },

    transitionend_videos: function(key) {

    },

    transitionend_images: function(key) {
      return;
      var first = Animation.data.background.images.first;
      var second = Animation.data.background.images.second;

      console.log('transition', key, second.classes.stage__image__show);

      switch (key) {
        case 'first':
          break;
        case 'second':
          if (second.classes.stage__image__show) {
            first.classes.stage__image__show = false;
            first.src = null;
          } else {
            second.src = null;
          }
          break;
      }
      Animation.blocked = false;
    },

    load_images: function(key) {
      return;
      var first = Animation.data.background.images.first;
      var second = Animation.data.background.images.second;

      console.log('load', key, second.classes.stage__image__show);

      switch (key) {
        case 'first':
          first.classes.stage__image__show = true;
          second.classes.stage__image__show = false;
          break;
        case 'second':
          second.classes.stage__image__show = true;
          break;
      }
    },

  },

  setBackgroundImage: function(src) {
    Animation.data.background.images.first.src = src;
    Animation.data.background.images.first.classes.stage__image__show = true;
    return;
    if (Animation.blocked) return;

    Animation.blocked = true;
    var isFirst = Animation.data.background.images.first.src === null;
    var isSecond = Animation.data.background.images.second.src === null;

    if (isFirst) {
      Animation.data.background.images.first.src = src;
    } else if (isSecond) {
      Animation.data.background.images.second.src = src;
    }
  },

  setVideo: function(video) {
    if (video.index === undefined) {
      if (video.shuffle) {
        video.index = getRandom(0, video.videos.length - 1);
      } else {
        video.index = 0;
      }
    }
    Animation.videos[video.container] = video;

    if (video.clear) {
      videos[video.container].player.stopVideo();
      Animation.data.step_images = true;
      return;
    }

    var current = video.videos[video.index];
    var options = {
      videoId: current.id,
      suggestedQuality: 'large',
    };

    if (current.start) {
      options.startSeconds = current.start;
    }

    if (current.end) {
      options.endSeconds = current.end;
    }

    var volume = current.volume;
    if (volume === undefined) {
      volume = 100;
    }
    videos[video.container].player.setVolume(volume);

    videos[video.container].player.loadVideoById(options);
  },

  setText: function(texts) {
    Animation.data.texts = texts;
  },

};
