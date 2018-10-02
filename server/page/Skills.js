module.exports = class Skills {

  static get layout() {
    return 'skills';
  }

  static build(request) {
    const data = request.getData();

    const build = {
      select: data && data.select || null,
      features: sys.loadData('features'),
      skills: sys.loadData('skills'),
      healths: sys.loadData('healths'),
      user: request.user(),
    };

    return Promise.all([
      sys.db.allKeyed('key', 'SELECT * FROM skill WHERE user = ?', build.user.name),
      sys.db.allKeyed('key', 'SELECT * FROM health WHERE user = ?', build.user.name),
    ])
      .then(function (bag) {
        const skillRows = bag[0];
        const healthRows = bag[1];

        for (const feature in build.features) {
          build.features[feature].key = feature;
          build.features[feature].base = skillRows[feature].base;
          build.features[feature].mod = skillRows[feature].mod;
          build.features[feature].value = skillRows[feature].base + skillRows[feature].mod;
        }
        for (const health in build.healths) {
          build.healths[health].key = health;
          build.healths[health].total = healthRows[health].total;
          build.healths[health].value = healthRows[health].value;
        }
        for (const page in build.skills) {
          build.select = build.select || page;
          for (const property in build.skills[page].properties) {
            build.skills[page].properties[property].key = property;
            build.skills[page].properties[property].base = skillRows[property].base;
            build.skills[page].properties[property].mod = skillRows[property].mod;
            build.skills[page].properties[property].value = skillRows[property].base + skillRows[property].mod;
          }
        }
        return build;
      });
  }

}
