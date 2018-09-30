const log = new sys.Logger('Device');

module.exports = class Device {

  constructor(uuid) {
    this._data = {
      uuid: uuid,
      user: null,
    };
    this._socket = null;
  }

  setSocket(socket) {
    this._socket = socket;
  }

  data() {
    return this._data;
  }

  socket() {
    return this._socket;
  }

  request(args) {
    return {
      device: this,
      args: args,
    }
  }

  submitForm(args) {
    log.log('Submit form [0]', args.vue.form);
    const form = require('./form/' + args.vue.form);

    form.submit(this, args);
  }

}
