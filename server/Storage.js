const Device = require('./entity/Device');

let log = null;

module.exports = class Storage {

  constructor(logger) {
    log = logger;

    this._devices = {};
    this._users = {};
    this._scene = null;
  }

  async setup() {
    for (const user of await sys.db.all('SELECT * FROM user')) {
      this._users[user.name] = user;
    }
  }

  devices() {
    return this._devices;
  }

  scene() {
    return this._scene;
  }

  getDevice(uuid, socket) {
    if (this._devices[uuid] === undefined) {
      this._devices[uuid] = new Device(uuid);
    }
    this._devices[uuid].setSocket(socket);
    return this._devices[uuid];
  }

  addUser(request, user) {
    const data = request.getData();
    const promises = [];
    this._users[user.name] = user;
    log.log('Add user [0]', user.name);

    for (const index in user.features) {
      user.features[index] = Math.floor((user.features[index] - 10) / 2) + 10;
    }

    user.points = data.calc_points;
    user.ini = user.features.body + user.features.body - user.features.endurance;

    promises.push(sys.db.insert('user', [user.name, user.age, user.gender, user.points, user.ini]));
    for (const feature in user.features) {
      log.debug('Add feature [0] with value [1] for user [2]', feature, user.features[feature], user.name);
      promises.push(sys.db.insert('skill', [user.name, feature, user.features[feature], 0]));
    }

    const features = sys.loadData('features');
    const symbols = {};
    for (const key in features) {
      symbols[features[key].symbol] = user.features[key];
    }

    const skills = sys.loadData('skills');
    for (const page in skills) {
      for (const skill in skills[page].properties) {
        const base = this._getSkillBase(symbols, skills[page].properties[skill]);

        log.debug('Add skill [0] with value [1] for user [2]', skill, base, user.name);
        promises.push(sys.db.insert('skill', [user.name, skill, base, 0]));
      }
    }

    for (const specific in data.specifics) {
      if (data.specifics[specific].active) {
        log.debug('Add specific [0] for user [2]', specific, user.name);
        promises.push(sys.db.insert('specific', [user.name, specific]));
      }
    }

    const life = user.features.body + user.features.body + user.features.endurance + user.features.skill;
    log.debug('Add health [0] with value [1] for user [2]', 'life', life, user.name);
    promises.push(sys.db.insert('health', [user.name, 'life', life, life]));

    const mental = user.features.spiritual + user.features.spiritual + user.features.intelligence + user.features.charm;
    log.debug('Add health [0] with value [1] for user [2]', 'mental', mental, user.name);
    promises.push(sys.db.insert('health', [user.name, 'mental', mental, mental]));

    return Promise.all(promises);
  }

  _getSkillBase(symbols, define) {
    let base = 0;

    for (const key of define.sample) {
      base += symbols[key];
    }
    return Math.max(Math.floor(base / define.sample.length) - 8, 0);
  }

  getSkills(user) {
    const data = {
      user: user,
      features: {},
      skills: {},
      healths: {},
      specifics: {},
    };
    return Promise.all([
      sys.db.allKeyed('key', 'SELECT * FROM skill WHERE user = ?', user.name),
      sys.db.allKeyed('key', 'SELECT * FROM health WHERE user = ?', user.name),
      sys.db.allKeyed('key', 'SELECT * FROM specific WHERE user = ?', user.name),
    ]).then((bag) => {
      const skills = bag[0];
      const healths = bag[1];
      const specifics = bag[2];
      const age_mod = Math.floor((parseInt(user.age) - 20) / 5);
      const modifiers = {};

      data.specifics = sys.loadData('specifics');
      for (const key in data.specifics) {
        data.specifics[key].key = key;
        data.specifics[key].type = 'specific';
        data.specifics[key].active = specifics[key] !== undefined;

        if (data.specifics[key].active) {
          modifiers[key] = data.specifics[key];
        }
      }

      data.features = sys.loadData('features');
      for (const key in data.features) {
        data.features[key].type = 'feature';
        data.features[key].key = key;
        data.features[key].base = skills[key].base;
        data.features[key].mod = skills[key].mod;
        data.features[key].calc_value = skills[key].base + skills[key].mod;
        this._executeModifier(modifiers, data.features[key], age_mod);
      }

      data.healths = sys.loadData('healths');
      for (const key in data.healths) {
        data.healths[key].type = 'health';
        data.healths[key].key = key;
        data.healths[key].value = healths[key].value;
        data.healths[key].total = healths[key].total;
      }

      data.skills = sys.loadData('skills');
      for (const page in data.skills) {
        data.skills[page].type = 'skill_page';
        for (const key in data.skills[page].properties) {
          data.skills[page].properties[key].type = 'skill';
          data.skills[page].properties[key].key = key;
          data.skills[page].properties[key].base = skills[key].base;
          data.skills[page].properties[key].mod = skills[key].mod;
          data.skills[page].properties[key].calc_value = skills[key].base + skills[key].mod;
          this._executeModifier(modifiers, data.skills[page].properties[key], age_mod);
        }
      }
      return data;
    });
  }

  _executeModifier(modifiers, value, age_mod) {
    for (const key in modifiers) {
      const modifier = modifiers[key];
      const execute = modifier.execute[value.type];

      if (execute && execute[value.key]) {
        value.calc_value += execute[value.key];
      }
    }
    if (value.key === 'body') {
      value.calc_value -= Math.floor(age_mod / 2);
    }
    if (value.key === 'spiritual') {
      value.calc_value += Math.floor(age_mod / 2);
    }
  }

  getUser(name) {
    return this._users[name] || null;
  }

  getDeviceByUser(name) {
    const devices = this.devices();

    for (const uuid in devices) {
      const device = devices[uuid];

      if (device.user().name === name) return device;
    }
    return null;
  }

  updatePoints(user, points) {
    user.points = points;
    return sys.db.update('user', { name: user.name }, {
      points: points,
    });
  }

  updateSkill(user, key, mod) {
    return sys.db.update('skill', { user: user.name, key: key }, { mod: mod });
  }

  updateHealth(user, key, value) {
    return sys.db.update('health', { user: user.name, key: key }, { value: value });
  }

  adminUser(user) {
    this._users[user.name] = user;
    this.getDeviceByUser(user.name).setUser(user);

    return sys.db.update('user', { name: user.name }, {
      age: user.age,
      gender: user.gender,
      points: user.points,
      ini: user.ini,
    });
  }

}
