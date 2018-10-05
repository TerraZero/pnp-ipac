const socket = io();

const videos = {
  music: {
    player: null,
    ready: false,
  },
  sound: {
    player: null,
    ready: false,
  },
};

const data = {
  data: null,
  videos: {
    music: {
      'scene__player--show': false,
    },
    sound: {
      'scene__player--show': false,
    },
  },
  chapter: null,
  loading: true,
};

const app = new Vue({
  el: '#app',
  data: data,
  methods: {

    getChapterStyle: function () {
      const style = {};

      if (this.data && this.data.stage) {
        style['color'] = this.data.stage.color;
      }
      return style;
    },

  },
});

function send(event, args, loading) {
  if (loading !== false) {
    data.loading = true;
  }
  socket.emit(event, {
    vue: data,
    args: args || null,
  });
}

function onYouTubeIframeAPIReady() {
  videos.music.player = new YT.Player('music', {
    width: '128',
    height: '96',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
    },
  });
  videos.sound.player = new YT.Player('sound', {
    width: '128',
    height: '96',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChangeSound,
    },
  });
}

function onPlayerReady(event) {
  videos[event.target.getIframe().id].ready = true;
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    event.target.playVideo();
  }
}

function onPlayerStateChangeSound(event) {
  if (event.data === YT.PlayerState.ENDED) {
    data.videos.sound['scene__player--show'] = false;
  }
}

socket.on('update:data', function (args) {
  data.data = args.data;
});

socket.on('update:video', function (args) {
  const video = videos[args.data.sound.type];

  if (video && video.ready) {
    video.player.loadVideoById(args.data.sound.video);
    data.videos[args.data.sound.type]['scene__player--show'] = true;
  }
});

socket.on('update:chapter', function (args) {
  data.chapter = args.data.chapter;
});

send('scene:register');
