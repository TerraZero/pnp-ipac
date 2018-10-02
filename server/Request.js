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

  getOverlay() {
    return this._args.vue.overlay;
  }

  getArgs() {
    return this._args.args;
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

  sendOverlay(name) {
    if (name) {
      log.log('Send overlay [0].', name);
      const overlay = require('./overlay/' + name);

      this._device.socket().emit('update:overlay', {
        overlay: overlay.build(this),
      });
    } else {
      log.log('Send close overlay.');

      this._device.socket().emit('update:overlay', {
        overlay: false,
      });
    }
  }

}
