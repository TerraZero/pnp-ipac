module.exports = class User {

  static build(request) {
    return this.query(request)
      .then(this.data.bind(this));
  }

  static query(request) {
    let user = null;
    const args = request.args();

    if (!args || !args.button) {
      user = request.data().user.name;
    } else {
      user = args.button.user;
    }

    return Promise.all([
      Promise.resolve(request),
      Promise.resolve(user),
      sys.db.allKeyed('key', 'SELECT * FROM skill WHERE user = ?', user),
      sys.db.allKeyed('key', 'SELECT * FROM health WHERE user = ?', user),
    ]);
  }

  static data(args) {
    const request = args[0];
    const skills = args[2];
    const healths = args[3];

    const data = {
      select: request.data() && request.data().select || 'user',
      groups: {},
      submit: 'User',
    };

    data.user = sys.storage.getUser(args[1]);

    const define = {
      features: sys.loadData('features'),
      skills: sys.loadData('skills'),
      healths: sys.loadData('healths'),
    };

    data.title = 'User - ' + data.user.name;

    data.groups.user = {
      key: 'user',
      label: 'User',
      fields: {
        age: this.getField('age', 'Alter', data.user.age),
        gender: this.getField('gender', 'Geschlecht', data.user.gender),
        ini: this.getField('ini', 'Initiative', data.user.ini),
        points: this.getField('points', 'Talent', data.user.points),
      },
      actions: this.getActions('user'),
    };

    data.groups.health = {
      key: 'health',
      label: 'Lebenspunkte',
      fields: {},
      actions: this.getActions('health'),
    };
    for (const key in define.healths) {
      data.groups.health.fields[key + ':total'] = this.getField(key, define.healths[key].name + ' - Gesamt', healths[key].total);
      data.groups.health.fields[key + ':value'] = this.getField(key, define.healths[key].name + ' - Wert', healths[key].value);
    }

    data.groups.feature = {
      key: 'feature',
      label: 'Charackter',
      fields: {},
      actions: this.getActions('skill', 'features'),
    };
    for (const key in define.features) {
      data.groups.feature.fields[key + ':base'] = this.getField(key, define.features[key].name + ' - Base', skills[key].base);
      data.groups.feature.fields[key + ':mod'] = this.getField(key, define.features[key].name + ' - Modifier', skills[key].mod);
    }

    for (const group in define.skills) {
      data.groups[group] = {
        key: group,
        label: define.skills[group].name,
        fields: {},
        actions: this.getActions('skill', 'skills', group),
      };

      for (const key in define.skills[group].properties) {
        data.groups[group].fields[key + ':base'] = this.getField(key, define.skills[group].properties[key].name + ' - Base', skills[key].base);
        data.groups[group].fields[key + ':mod'] = this.getField(key, define.skills[group].properties[key].name + ' - Modifier', skills[key].mod);
      }
    }

    return {
      display: 'user',
      data: data,
    };
  }

  static getField(key, label, value) {
    return {
      key: key,
      label: label,
      original: value,
      value: value,
    };
  }

  static getActions(group, data, skill) {
    return {
      submit: {
        group: group,
        data: data || null,
        skill: skill || null,
        key: 'save',
        text: 'Save',
      }
    };
  }

  static submit(request) {
    const args = request.args();

    this['submit_' + args.action.group](request, args)
      .then(() => {
        request.forceRequest(request.data().user.name, {
          func: 'sendPage',
          args: ['Skills'],
        });
        request.sendPage('User');
      });
  }

  static submit_user(request, args) {
    const data = request.data();
    const user = data.user;

    for (const field in args.group.fields) {
      user[field] = args.group.fields[field].value;
    }

    return sys.storage.adminUser(user);
  }

  static submit_health(request, args) {
    const updates = [];
    const healths = sys.loadData('healths');

    for (const key in healths) {
      updates.push(sys.db.update('health', 'key', key, {
        total: args.group.fields[key + ':total'].value,
        value: args.group.fields[key + ':value'].value,
      }));
    }
    return Promise.all(updates);
  }

  static submit_skill(request, args) {
    const updates = [];
    let data = sys.loadData(args.action.data);

    if (args.action.skill) {
      data = data[args.action.skill].properties;
    }

    for (const key in data) {
      updates.push(sys.db.update('skill', 'key', key, {
        base: args.group.fields[key + ':base'].value,
        mod: args.group.fields[key + ':mod'].value,
      }));
    }
    return Promise.all(updates);
  }

}
