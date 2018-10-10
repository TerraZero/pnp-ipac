var videos = {
  v_background: {
    player: null,
    ready: false,
    config: {
      width: '100%',
      height: '100%',
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    },
  },
  v_music: {
    player: null,
    ready: false,
    config: {
      width: 10,
      height: 10,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    },
  },
  v_layer: {
    player: null,
    ready: false,
    config: {
      width: 10,
      height: 10,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    },
  },
  v_sound: {
    player: null,
    ready: false,
    config: {
      width: 10,
      height: 10,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        showinfo: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    },
  },
};

function onYouTubeIframeAPIReady() {
  for (var index in videos) {
    videos[index].player = new YT.Player(index, videos[index].config);
  }
}

function onPlayerReady(event) {
  var name = event.target.getIframe().id;
  var video = videos[name];

  video.ready = true;
  Animation.on.playerReady(event, video, name);
}

function onPlayerStateChange(event) {
  var name = event.target.getIframe().id;
  var video = videos[name];

  Animation.on.playerStateChange(event, video, name);
}
