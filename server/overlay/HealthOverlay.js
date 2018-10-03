module.exports = class HealthOverlay {

  static build(request) {
    const args = request.getArgs();

    const data = {
      type: 'HealthOverlay',
      value: args.value,
      current: args.value.value,
      buttons: [
        {
          text: 'OK',
          type: 'update',
        },
        {
          text: 'Abbruch',
          type: 'cancel',
        },
      ],
    };

    return data;
  }

  static submit(request) {
    const args = request.getArgs();
    const button = args.button;

    if (button.type == 'cancel') {
      request.sendOverlay();
    } else {
      const overlay = request.getOverlay();
      const user = request.user();

      sys.storage.updateHealth(user, overlay.value.key, overlay.current)
        .then(() => {
          request.sendPage('Skills');
          request.sendOverlay();
        });
    }
  }

}
