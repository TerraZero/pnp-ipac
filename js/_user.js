const socket = io();

let meta = {
  uuid: getCookie('pnp-uuid') || null,
};
const data = {
  display: 'none',
  data: null,
  loading: true,
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

socket.on('update:overlay', (args) => {
  data.overlay = args.overlay;
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

    cOverlay: function (value) {
      send('overlay', {
        type: 'SkillOverlay',
        value: value,
      });
    },

    submitOverlay: function (button) {
      send('overlay:submit', {
        button: button || null,
        costs: this.overlaySkillCosts,
      });
    },

    overlaySkillValue: function (value) {

    },

    overlaySkillDown: function () {
      if (this.overlay.level.value > this.overlay.level.original) {
        this.overlay.level.value--;
      }
    },

    overlaySkillUp: function () {
      this.overlay.level.value++;
      if (this.overlaySkillPoints < 0) {
        this.overlay.level.value--;
      }
    },

    getCosts: function (cost, value) {
      return (Math.floor(value / 5) || 1) * cost;
    },

  },

  computed: {

    overlaySkillCosts: function () {
      let costs = 0;

      for (let i = this.overlay.level.original; i < this.overlay.level.value; i++) {
        costs += this.getCosts(this.overlay.value.cost, i);
      }
      return costs;
    },

    overlaySkillPoints: function () {
      return this.data.user.points - this.overlaySkillCosts;
    },

  },

});

function send(event, args, loading) {
  if (loading !== false) {
    data.loading = true;
  }
  socket.emit(event, {
    meta: meta,
    vue: data,
    args: args || null,
  });
}

send('register');
