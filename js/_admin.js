const socket = io();

const data = {
  menu: null,
  display: 'none',
  data: null,
  loading: true,
};

const app = new Vue({
  el: '#app',
  data: data,
  methods: {

    icon: function (name) {
      return '/img/icons/' + name + '.svg';
    },

    menuOpen: function (level, button) {
      this.menu[level].select = button.type;
      send('admin:menu', {
        level: level,
        button: button,
      });
    },

    submit: function (group, action) {
      send('admin:submit', {
        group: group,
        action: action,
      });
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
