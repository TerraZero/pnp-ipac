const log = new sys.Logger('Request');

module.exports = class Request {

  constructor(event, device, args) {
    this._event = event;
    this._device = device;
    this._args = args;
  }

  event() {
    return this._event;
  }

  getMeta() {
    return this._args.meta;
  }

  getData() {
    return this._args.vue.data;
  }

  getArgs() {
    return this._args.args;
  }

  getFrame(name) {
    return this._args.vue.frames[name];
  }

  device() {
    return this._device;
  }

  user() {
    return this._device.user();
  }

  resend(reason) {
    log.log('Resend - [0]', reason);
    this._device.socket().emit('update:display', this._args.vue);
  }

  sendMeta(meta) {
    log.log('Send meta.');
    this._device.socket().emit('update:meta', {
      meta: meta,
    });
  }

  sendDisplay(display, data) {
    log.log('Send display [0].', display);

    this._device.socket().emit('update:display', {
      display: display,
      data: data,
    });
  }

  sendPage(name) {
    const page = require('./page/' + name);

    page.build(this)
      .then((data) => {
        this.sendDisplay(page.layout, data);
      });
  }

  sendForm(name) {
    const form = require('./form/' + name);

    this.sendDisplay('form', form.build(this));
  }

  submit() {
    const struckt = this.getArgs().struckt;
    const func = this.getArgs().func;

    const object = require('./submit/' + struckt);

    object[func](this);
  }

}
