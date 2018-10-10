const Menu = require('./admin/Menu');
const log = new sys.Logger('AdminRequest');

module.exports = class AdminRequest {

  constructor(socket, args) {
    this._socket = socket;
    this._args = args;
  }

  data() {
    return this._args.vue.data;
  }

  display() {
    return this._args.vue.display;
  }

  args() {
    return this._args.args;
  }

  menu() {
    return this._args.vue.menu;
  }

  socket() {
    return this._socket;
  }

  sendMenu() {
    this.socket().emit('update:menu', {
      menu: Menu.build(this),
    });
  }

  sendDisplay(display, data) {
    log.log('Send display [0].', display);

    this.socket().emit('update:display', {
      display: display,
      data: data,
    });
  }

  sendPage(name) {
    log.log('Send page [0].', name);

    const Page = require('./admin/' + name);

    Page.build(this)
      .then((data) => {
        this.socket().emit('update:display', data);
      });
  }

  submit() {
    const data = this.data();

    const Page = require('./admin/' + data.submit);

    Page.submit(this);
  }

  forceRequest(user, args) {
    const device = sys.storage.getDeviceByUser(user);

    if (device !== null) {
      device.socket().emit('force:request', args);
    }
  }

}

