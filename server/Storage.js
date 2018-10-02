const Device = require('./entity/Device');

let log = null;

module.exports = class Storage {

  constructor(logger) {
    log = logger;

    this._devices = {};
    this._users = {};
  }

  async setup() {
    for (const user of await sys.db.all('SELECT * FROM user')) {
      this._users[user.name] = user;
    }
  }

  devices() {
    return this._devices;
  }

  getDevice(uuid, socket) {
    if (this._devices[uuid] === undefined) {
      this._devices[uuid] = new Device(uuid);
    }
    this._devices[uuid].setSocket(socket);
    return this._devices[uuid];
  }

  addUser(request, user) {
    const promises = [];
    this._users[user.name] = user;
    log.log('Add user [0]', user.name);

    for (const index in user.features) {
      user.features[index] = Math.floor((user.features[index] - 10) / 2) + 10;
    }

    const age_mod = Math.floor((parseInt(user.age) - 20) / 5);
    const age_mod_half = Math.floor(age_mod / 2);
    user.features.body = user.features.body - age_mod_half;
    user.points = 20 + age_mod;
    user.ini = user.features.body + user.features.body - user.features.endurance + age_mod_half;

    promises.push(sys.db.insert('user', [user.name, user.age, user.gender, user.points, user.ini]));
    for (const feature in user.features) {
      log.debug('Add feature [0] with value [1] for user [2]', feature, user.features[feature], user.name);
      promises.push(sys.db.insert('skill', [user.name, feature, user.features[feature], 0]));
    }

    const features = sys.loadData('features');
    const symbols = {};
    for (const key in features) {
      if (features[key].symbol == 'KK') {
        symbols[features[key].symbol] = user.features[key] - age_mod;
      } else if (features[key].symbol == 'GS') {
        symbols[features[key].symbol] = user.features[key] + age_mod;
      } else {
        symbols[features[key].symbol] = user.features[key];
      }
    }

    const skills = sys.loadData('skills');
    for (const page in skills) {
      for (const skill in skills[page].properties) {
        const base = this._getSkillBase(symbols, skills[page].properties[skill], age_mod);

        log.debug('Add skill [0] with value [1] for user [2]', skill, base, user.name);
        promises.push(sys.db.insert('skill', [user.name, skill, base, 0]));
      }
    }

    const life = user.features.body + user.features.body + user.features.endurance + user.features.skill - age_mod;
    log.debug('Add health [0] with value [1] for user [2]', 'life', life, user.name);
    promises.push(sys.db.insert('health', [user.name, 'life', life, life]));

    const mental = user.features.spiritual + user.features.spiritual + user.features.intelligence + user.features.charm + age_mod;
    log.debug('Add health [0] with value [1] for user [2]', 'mental', mental, user.name);
    promises.push(sys.db.insert('health', [user.name, 'mental', mental, mental]));

    return Promise.all(promises);
  }

  _getSkillBase(symbols, define, age_mod) {
    let base = 0;

    for (const key of define.sample) {
      base += symbols[key];
    }
    return Math.max(Math.floor(base / define.sample.length) - 8, 0);
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
    return sys.db.update('user', 'name', user.name, {
      points: points,
    });
  }

  updateSkill(key, mod) {
    return sys.db.update('skill', 'key', key, { mod: mod });
  }

  adminUser(user) {
    this._users[user.name] = user;
    this.getDeviceByUser(user.name).setUser(user);

    return sys.db.update('user', 'name', user.name, {
      age: user.age,
      gender: user.gender,
      points: user.points,
      ini: user.ini,
    });
  }

}
