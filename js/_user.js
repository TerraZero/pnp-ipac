var socket = io();

var meta = {
  uuid: getCookie('pnp-uuid') || null,
};
var data = {
  display: 'none',
  data: null,
  loading: true,
  fullscreen: false,
  frames: {
    update: {
      current: null,
      state: null,
    },
  },
};

var app = new Vue({
  el: '#app',
  data: data,

  methods: {

    submit: function(button) {
      send('submit:form', {
        button: button || null,
      });
    },

    icon: function(name) {
      return '/img/icons/' + name + '.svg';
    },

    gender: function(gender) {
      if (gender == 'male') return 'Männlich';
      if (gender == 'female') return 'Weiblich';
      return 'Andere';
    },

    onClickSkill: function(value) {
      if (this.frames.update.current === value) {
        this.frames.update.current = null;
        this.frames.update.state = null;
      } else {
        this.frames.update.current = value;
        this.frames.update.state = {
          costs: 0,
          current: value.total,
          delta: 0,
        };
      }
    },

    onClickHealth: function(value) {
      if (this.frames.update.current === value) {
        this.frames.update.current = null;
        this.frames.update.state = null;
      } else {
        this.frames.update.current = value;
        this.frames.update.state = {
          current: value.value,
        };
      }
    },

    onClickSkillChange: function(delta) {
      var frame = this.frames.update;
      var newCurrent = frame.state.current + delta;
      var total = this.getCostsTotal(frame.current.total, newCurrent, frame.current.cost);

      if (frame.current.total <= newCurrent && this.data.user.points - total >= 0) {
        frame.state.current = newCurrent;
        frame.state.costs = total;
        frame.state.delta = newCurrent - frame.current.total;
      }
    },

    onClickHealthChange: function(delta) {
      var frame = this.frames.update;
      var newCurrent = frame.state.current + delta;

      if (newCurrent >= 0 && newCurrent <= frame.current.total) {
        frame.state.current = newCurrent;
      }
    },

    onSubmit: function(struckt, func) {
      send('submit', {
        struckt: struckt,
        func: func,
      });
    },

    getCostsTotal: function(from, to, cost) {
      var costs = 0;

      for (var i = from; i < to; i++) {
        costs += this.getCosts(cost, i);
      }
      return costs;
    },

    getCosts: function(cost, value) {
      return (Math.floor(value / 5) || 1) * cost;
    },

    getExtraPoints: function(specific) {
      switch (specific.orientation) {
        case 'negative':
          return specific.level * 5;
        case 'neutral':
          return 0;
        case 'positive':
          return specific.level * -10;
      }
    },

    getExtraPointsLabel: function(specific) {
      var extraPoints = this.getExtraPoints(specific);

      switch (specific.orientation) {
        case 'negative':
          return '+ ' + extraPoints + ' Talent';
        case 'neutral':
          return '+/- ' + extraPoints + ' Talent';
        case 'positive':
          return '- ' + extraPoints + ' Talent';
      }
    },

    validSpecific: function(specific) {
      if (specific.active) {
        return this.calcPoints - this.getExtraPoints(specific) >= 0;
      } else {
        return this.calcPoints + this.getExtraPoints(specific) >= 0;
      }
    },

    onClickFullscreen: function() {
      if (this.fullscreen) {
        exitFullScreen();
      } else {
        enterFullScreen();
      }
      this.fullscreen = !this.fullscreen;
    },

  },

  computed: {

    calcPoints: function() {
      var points = this.data.points + Math.floor((parseInt(this.data.fields.age.value || 20) - 20) / 5);

      for (var key in this.data.specifics) {
        if (this.data.specifics[key].active) {
          points += this.getExtraPoints(this.data.specifics[key]);
        }
      }
      this.data.calc_points = points;
      return points;
    },

  },

});

function send(event, args, loading) {
  console.log('-> send:', event);
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

socket.on('force:request', (args) => {
  send('force:request', args);
});

send('register');
