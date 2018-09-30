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

    user.points = 20;
    user.ini = user.features.body + user.features.body - user.features.endurance;

    promises.push(sys.db.insert('user', [user.name, user.age, user.gender, user.points, user.ini]));
    for (const feature in user.features) {
      log.debug('Add feature [0] with value [1] for user [2]', feature, user.features[feature], user.name);
      promises.push(sys.db.insert('skill', [user.name, feature, user.features[feature], 0]));
    }

    const skills = sys.loadData('skills');
    for (const page in skills) {
      for (const skill in skills[page].properties) {
        log.debug('Add skill [0] with value [1] for user [2]', skill, 0, user.name);
        promises.push(sys.db.insert('skill', [user.name, skill, 0, 0]));
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

  getUser(request) {
    const meta = request.getMeta();

    return this._users[meta.user] || null;
  }

}
