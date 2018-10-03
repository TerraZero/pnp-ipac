module.exports = class User {

  static build(request) {
    const args = request.args();
    const user = sys.storage.getUser(args.button && args.button.user || request.data().user.name);

    return sys.storage.getSkills(user)
      .then((data) => {
        return this.data(request, data);
      });
  }

  static data(request, skills) {
    for (const key in skills.specifics) {
      skills.specifics[key].open = false;
    }

    const data = {
      select: request.data() && request.data().select || 'user',
      groups: {},
      submit: 'User',
      user: skills.user,
      specifics: skills.specifics,
    };

    data.title = 'User - ' + skills.user.name;

    data.groups.user = {
      key: 'user',
      label: 'User',
      fields: {
        age: this.getField('age', 'Alter', skills.user.age),
        gender: this.getField('gender', 'Geschlecht', skills.user.gender),
        ini: this.getField('ini', 'Initiative', skills.user.ini),
        points: this.getField('points', 'Talent', skills.user.points),
      },
      actions: this.getActions('user'),
    };

    data.groups.health = {
      key: 'health',
      label: 'Lebenspunkte',
      fields: {},
      actions: this.getActions('health'),
    };
    for (const key in skills.healths) {
      data.groups.health.fields[key + ':total'] = this.getField(key, skills.healths[key].name + ' - Gesamt', skills.healths[key].total);
      data.groups.health.fields[key + ':value'] = this.getField(key, skills.healths[key].name + ' - Wert', skills.healths[key].value);
    }

    data.groups.feature = {
      key: 'feature',
      label: 'Charakter',
      fields: {},
      actions: this.getActions('skill', 'features'),
    };
    for (const key in skills.features) {
      data.groups.feature.fields[key + ':base'] = this.getField(key, skills.features[key].name + ' - Base', skills.features[key].base, skills.features[key].calc_value);
      data.groups.feature.fields[key + ':mod'] = this.getField(key, skills.features[key].name + ' - Modifier', skills.features[key].mod, skills.features[key].calc_value);
    }

    for (const group in skills.skills) {
      data.groups[group] = {
        key: group,
        label: skills.skills[group].name,
        fields: {},
        actions: this.getActions('skill', 'skills', group),
      };

      for (const key in skills.skills[group].properties) {
        data.groups[group].fields[key + ':base'] = this.getField(key, skills.skills[group].properties[key].name + ' - Base', skills.skills[group].properties[key].base, skills.skills[group].properties[key].calc_value);
        data.groups[group].fields[key + ':mod'] = this.getField(key, skills.skills[group].properties[key].name + ' - Modifier', skills.skills[group].properties[key].mod, skills.skills[group].properties[key].calc_value);
      }
    }

    return {
      display: 'user',
      data: data,
    };
  }

  static getField(key, label, value, calculated) {
    return {
      key: key,
      label: label,
      original: value,
      value: value,
      calculated: calculated || null,
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
      updates.push(sys.db.update('health', { key: key }, {
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
      updates.push(sys.db.update('skill', { key: key }, {
        base: args.group.fields[key + ':base'].value,
        mod: args.group.fields[key + ':mod'].value,
      }));
    }
    return Promise.all(updates);
  }

  static submitSpecific(request) {
    const args = request.args();
    const user = request.data().user;

    let promise = null;
    if (args.specific.active) {
      promise = sys.db.delete('specific', { user: user.name, key: args.specific.key });
    } else {
      promise = sys.db.insert('specific', [user.name, args.specific.key]);
    }

    promise.then(() => {
      request.forceRequest(request.data().user.name, {
        func: 'sendPage',
        args: ['Skills'],
      });
      request.sendPage('User');
    });
  }

}
