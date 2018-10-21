var socket = io();

var data = {
  menu: null,
  display: 'none',
  data: null,
  loading: true,
};

var app = new Vue({
  el: '#app',
  data: data,
  methods: {

    icon: function(name) {
      return '/img/icons/' + name + '.svg';
    },

    menuOpen: function(level, button) {
      this.menu[level].select = button.type;
      send('admin:menu', {
        level: level,
        button: button,
      });
    },

    submit: function(group, action) {
      send('admin:submit', {
        group: group,
        action: action,
      });
    },

    submitSpecific: function(specific) {
      send('admin:submit:specific', {
        specific: specific,
      });
    },

    scene: function(media) {
      send('admin:scene:update', {
        media: media,
      }, false);
    },

    setStage: function(stage) {
      this.data.select = stage;
      send('admin:stage', {
        stage: stage,
      }, false);
    },

    setSound: function(sound) {
      send('admin:sound', {
        sound: sound,
      }, false);
    },

    setChapter: function(chapter) {
      this.data.select = chapter;
      send('admin:chapter', {
        chapter: chapter,
      }, false);
    },

    getYTImage: function(id, resolution) {
      resolution = resolution || 'sddefault';
      return 'http://img.youtube.com/vi/' + id + '/' + resolution + '.jpg';
    },

  },
  computed: {

    mediaOptions: function() {
      var options = {};

      for (var index in this.data.stages) {
        options[this.data.stages[index].category] = {
          value: this.data.stages[index].category,
          text: this.data.stages[index].category,
        };
      }
      return options;
    },

    mediaItems: function() {
      var items = [];

      for (var index in this.data.stages) {
        if (this.data.stages[index].category === this.data.select) {
          items.push(this.data.stages[index]);
        }
      }
      return items;
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

socket.on('update:menu', (args) => {
  data.menu = args.menu;
  data.loading = false;
});

socket.on('update:display', (args) => {
  data.display = args.display;
  data.data = args.data;
  data.loading = false;
});

send('admin:menu');
