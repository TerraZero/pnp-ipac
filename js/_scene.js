var socket = io();

var data = {
  loading: true,
  background: {
    videos: {
      video: {
        classes: {
          stage__video__show: false,
        },
      },
    },
    images: {
      first: {
        src: null,
        classes: {
          stage__image__transition: false,
          stage__image__show: false,
        },
      },
      second: {
        src: null,
        classes: {
          stage__image__transition: false,
          stage__image__show: false,
        },
      },
    }
  },
  texts: {
    title: 'Darkest Mansion',
    subline: 'Legend of the Darkest',
    glitch: true,
    style: {},
  },
};

Animation.data = data;

var app = new Vue({
  el: '#app',
  data: data,
  methods: {

    onTransitionend: function(type, key) {
      Animation.on['transitionend_' + type](key);
    },

    onLoad: function(type, key) {
      Animation.on['load_' + type](key);
    },

  },
  computed: {

    textStyles: function() {
      var styles = {};

      if (this.texts.glitch) {
        styles['animation'] = 'glitch 32s ease-in-out infinite';
      }
      return styles;
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

socket.on('scene:image', (args) => {
  console.log(args);
});

send('scene:register');

Animation.setBackgroundImage('https://img.wallpapersafari.com/desktop/1920/1080/49/92/r5ltTM.jpeg');
