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

    hOverlay: function (value) {
      send('overlay', {
        type: 'HealthOverlay',
        value: value,
      });
    },

    submitOverlay: function (button) {
      send('overlay:submit', {
        button: button || null,
        costs: this.overlaySkillCosts,
      });
    },

    submitOverlayHealth: function (button) {
      send('overlay:submit', {
        button: button || null,
      });
    },

    overlayHealthDown: function () {
      this.overlay.current = Math.max(this.overlay.current - 1, 0);
    },

    overlayHealthUp: function () {
      this.overlay.current = Math.min(this.overlay.current + 1, this.overlay.value.total);
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

    getExtraPoints: function (specific) {
      switch (specific.orientation) {
        case 'negative':
          return '+ ' + (specific.level * 5) + ' Talent';
        case 'neutral':
          return '+/- 0 Talent';
        case 'positive':
          return '- ' + (specific.level * 10) + ' Talent';
      }
    },

    validSpecific: function (specific) {
      if (specific.active) {
        return this.calcPoints - getExtraPoints(specific) >= 0;
      } else {
        return this.calcPoints + getExtraPoints(specific) >= 0;
      }
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

    calcPoints: function () {
      let points = this.data.points + Math.floor((parseInt(this.data.fields.age.value || 20) - 20) / 5);

      for (const key in this.data.specifics) {
        if (this.data.specifics[key].active) {
          points += getExtraPoints(this.data.specifics[key]);
        }
      }
      this.data.calc_points = points;
      return points;
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

function getExtraPoints(specific) {
  switch (specific.orientation) {
    case 'negative':
      return specific.level * 5;
    case 'positive':
      return specific.level * -10;
  }
  return 0;
}

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

socket.on('force:request', (args) => {
  send('force:request', args);
});

send('register');
