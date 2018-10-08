module.exports = class HealthSubmit {

  static userUpdate(request) {
    const frame = request.getFrame('update');
    const user = request.user();

    sys.storage.updateHealth(user, frame.current.key, frame.state.current)
      .then(() => {
        request.sendPage('Skills');
      });
  }

}
