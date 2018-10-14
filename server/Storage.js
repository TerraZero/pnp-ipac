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

  users() {
    return this._users;
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

    const modifiers = [this.getUserProfession(user).modify];

    for (const index in user.features) {
      user.features[index] = Math.floor((user.features[index] - 10) / 2) + 10;
    }

    const ini = {
      type: 'user',
      key: 'ini',
      total: user.features.body + user.features.body - user.features.endurance,
    };

    this._applyModifiers(modifiers, ini);

    user.points = data.calc_points;
    user.ini = ini.total;

    promises.push(sys.db.insert('user', [user.name, user.age, user.gender, user.points, user.ini, user.profession]));
    for (const feature in user.features) {
      log.debug('Add feature [0] with value [1] for user [2]', feature, user.features[feature], user.name);
      promises.push(sys.db.insert('skill', [user.name, feature, user.features[feature]]));
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
        promises.push(sys.db.insert('skill', [user.name, skill, base]));
      }
    }

    for (const specific in data.specifics) {
      if (data.specifics[specific].active) {
        log.debug('Add specific [0] for user [2]', specific, user.name);
        promises.push(sys.db.insert('specific', [user.name, specific]));
      }
    }

    const life = {
      type: 'user',
      key: 'life',
      total: user.features.body + user.features.body + user.features.endurance + user.features.skill,
    };

    this._applyModifiers(modifiers, life);
    log.debug('Add health [0] with value [1] for user [2]', 'life', life.total, user.name);
    promises.push(sys.db.insert('health', [user.name, 'life', life.total, life.total]));

    const mental = {
      type: 'user',
      key: 'mental',
      total: user.features.spiritual + user.features.spiritual + user.features.intelligence + user.features.charm,
    };

    this._applyModifiers(modifiers, mental);
    log.debug('Add health [0] with value [1] for user [2]', 'mental', mental.total, user.name);
    promises.push(sys.db.insert('health', [user.name, 'mental', mental.total, mental.total]));

    return Promise.all(promises);
  }

  _getSkillBase(symbols, define) {
    let base = 0;

    for (const key of define.sample) {
      base += symbols[key];
    }
    return Math.max(Math.floor(base / define.sample.length) - 8, 0);
  }

  getUserProfession(user) {
    const professions = sys.loadData('professions');

    return professions[user.profession];
  }

  getSkills(user) {
    const data = {
      user: user,
      features: {},
      skills: {},
      healths: {},
      specifics: {},
      profession: this.getUserProfession(user),
    };
    return Promise.all([
      sys.db.allKeyed('key', 'SELECT * FROM skill WHERE user = ?', user.name),
      sys.db.allKeyed('key', 'SELECT * FROM health WHERE user = ?', user.name),
      sys.db.allKeyed('key', 'SELECT * FROM specific WHERE user = ?', user.name),
    ]).then((bag) => {
      const skills = bag[0];
      const healths = bag[1];
      const specifics = bag[2];
      const modifiers = {
        profession: data.profession.modify,
      };

      data.specifics = sys.loadData('specifics');
      for (const key in data.specifics) {
        data.specifics[key].key = key;
        data.specifics[key].type = 'specific';
        data.specifics[key].active = specifics[key] !== undefined;

        if (data.specifics[key].active) {
          modifiers[key] = data.specifics[key].modify;
        }
      }

      modifiers['age_mod'] = {
        feature: {
          body: -Math.floor((parseInt(user.age) - 20) / 10),
          spiritual: Math.floor((parseInt(user.age) - 20) / 10),
        }
      };

      data.features = sys.loadData('features');
      for (const key in data.features) {
        data.features[key].type = 'feature';
        data.features[key].key = key;
        data.features[key].value = skills[key].value;
        data.features[key].total = skills[key].value;
        this._applyModifiers(modifiers, data.features[key]);
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
          data.skills[page].properties[key].value = skills[key].value;
          data.skills[page].properties[key].total = skills[key].value;
          this._applyModifiers(modifiers, data.skills[page].properties[key]);
        }
      }
      return data;
    });
  }

  _applyModifiers(modifiers, value) {
    for (const key in modifiers) {
      const modifier = modifiers[key];
      const execute = modifier[value.type];

      if (execute && execute[value.key]) {
        value.total += execute[value.key];
      }
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

  updateSkill(user, key, value) {
    return sys.db.update('skill', { user: user.name, key: key }, { value: value });
  }

  updateHealth(user, key, value) {
    return sys.db.update('health', { user: user.name, key: key }, { value: value });
  }

  adminUser(user) {
    this._users[user.name] = user;
    const device = this.getDeviceByUser(user.name);

    if (device !== null) {
      device.setUser(user);
    }

    return sys.db.update('user', { name: user.name }, {
      age: user.age,
      gender: user.gender,
      points: user.points,
      ini: user.ini,
    });
  }

  getSkillsFlatten() {
    const skills = sys.loadData('skills');
    const flatten = {};

    for (const page in skills) {
      for (const key in skills[page].properties) {
        flatten[key] = skills[page].properties[key];
      }
    }
    return flatten;
  }

  getProfessions() {
    const skills = this.getSkillsFlatten();
    const features = sys.loadData('features');
    const professions = sys.loadData('professions');

    for (const index in professions) {
      professions[index].description = this.getProfessionDescription(professions[index], skills, features);
    }
    return professions;
  }

  getProfessionDescription(profession, skills = null, features = null) {
    if (skills === null) skills = this.getSkillsFlatten();
    if (features === null) features = sys.loadData('features');
    const descriptions = [];

    for (const line of profession.description) {
      descriptions.push(line);
    }

    if (profession.modify.user) {
      const user = profession.modify.user;

      if (user.life) descriptions.push('Lebenspunkte: ' + this._getNumber(user.life));
      if (user.mental) descriptions.push('Moral: ' + this._getNumber(user.mental));
      if (user.ini) {
        if (user.ini > 0) {
          descriptions.push('Initiative: ' + this._getNumber(user.ini) + ' (Negativ)');
        } else {
          descriptions.push('Initiative: ' + this._getNumber(user.ini) + ' (Positiv)')
        }
      }
    }
    if (profession.modify.feature) {
      for (const key in profession.modify.feature) {
        descriptions.push(features[key].name + ': ' + this._getNumber(profession.modify.feature[key]));
      }
    }
    if (profession.modify.skill) {
      for (const key in profession.modify.skill) {
        descriptions.push(skills[key].name + ': ' + this._getNumber(profession.modify.skill[key]));
      }
    }
    return descriptions;
  }

  _getNumber(number) {
    if (number > 0) {
      return '+' + Math.abs(number);
    } else if (number < 0) {
      return '-' + Math.abs(number);
    } else {
      return '+/- 0';
    }
  }

}
