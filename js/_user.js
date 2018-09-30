const socket = io();

let meta = {
  uuid: getCookie('pnp-uuid') || null,
};
const data = {
  display: 'none',
  data: null,
  loading: false,
  overlay: false,
};

socket.on('update:meta', (args) => {
  meta = args.meta;
  setCookie('pnp-uuid', meta.uuid);
});

socket.on('update:display', (args) => {
  data.display = args.display;
  data.data = args.data;
  data.loading = false;
});

const app = new Vue({
  el: '#app',
  data: data,

  methods: {

    submit: function (button) {
      console.log('submit', button);
      send('submit', {
        button: button || null,
      });
    },

    icon: function (name) {
      return '/img/icons/' + name + '.svg';
    },

    gender: function (gender) {
      if (gender == 'male') return 'Männlich';
      if (gender == 'female') return 'Weiblich';
      return 'Andere';
    },

    clickSkillPoint: function (type, value, category) {
      this.overlay = {
        type: 'skill',
        label: value.name,
        value: value.value,
        cost: 2,
      };
    },

    clickOverlay: function (accept) {
      if (accept) {

      } else {
        this.overlay = false;
      }
    },

  },

  computed: {

    validUpdate: function () {
      return this.overlay.cost <= this.data.user.points;
    },

  },

});

function send(event, args) {
  data.loading = true;
  socket.emit(event, {
    meta: meta,
    vue: data,
    args: args || null,
  });
}

send('register');
