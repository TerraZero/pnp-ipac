module.exports = class SkillOverlay {

  static build(request) {
    const data = {
      type: 'SkillOverlay',
      value: request.getArgs().value,
      level: {
        original: request.getArgs().value.value,
        value: request.getArgs().value.value,
      },
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

    if (button.type == 'cancel' || args.costs === 0) {
      request.sendOverlay();
    } else if (button.type == 'update') {
      const overlay = request.getOverlay();
      const user = request.user();

      sys.storage.updatePoints(user, user.points - args.costs);

      sys.storage.updateSkill(overlay.value.key, overlay.level.value - overlay.value.base)
        .then(() => {
          request.sendPage('Skills');
          request.sendOverlay();
        });
    }
  }

}
