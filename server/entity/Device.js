module.exports = class Device {

  constructor(uuid) {
    this._uuid = uuid;
    this._user = null;
    this._socket = null;
  }

  setSocket(socket) {
    this._socket = socket;
  }

  setUser(user) {
    this._user = user;
  }

  socket() {
    return this._socket;
  }

  user() {
    return this._user;
  }

}
