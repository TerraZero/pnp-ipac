module.exports = class Skills {

  static get layout() {
    return 'skills';
  }

  static build(request) {
    const data = {
      select: null,
      features: sys.loadData('features'),
      skills: sys.loadData('skills'),
      healths: sys.loadData('healths'),
      user: sys.storage.getUser(request),
    };

    return Promise.all([
      sys.db.allKeyed('key', 'SELECT * FROM skill WHERE user = ?', request.getMeta().user),
      sys.db.allKeyed('key', 'SELECT * FROM health WHERE user = ?', request.getMeta().user),
    ])
      .then(function (bag) {
        const skillRows = bag[0];
        const healthRows = bag[1];

        for (const feature in data.features) {
          data.features[feature].base = skillRows[feature].base;
          data.features[feature].mod = skillRows[feature].mod;
          data.features[feature].value = skillRows[feature].base + skillRows[feature].mod;
        }
        for (const health in data.healths) {
          data.healths[health].total = healthRows[health].total;
          data.healths[health].value = healthRows[health].value;
        }
        for (const page in data.skills) {
          data.select = data.select || page;
          for (const property in data.skills[page].properties) {
            data.skills[page].properties[property].base = skillRows[property].base;
            data.skills[page].properties[property].mod = skillRows[property].mod;
            data.skills[page].properties[property].value = skillRows[property].base + skillRows[property].mod;
          }
        }
        return data;
      });
  }

}
