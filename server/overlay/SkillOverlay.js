module.exports = class SkillOverlay {

  static build(request) {
    const data = {
      type: 'SkillOverlay',
      value: request.getArgs().value,
      level: {
        original: request.getArgs().value.calc_value,
        value: request.getArgs().value.calc_value,
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

      sys.storage.updateSkill(user, overlay.value.key, overlay.value.mod + overlay.level.value - overlay.value.calc_value)
        .then(() => {
          request.sendPage('Skills');
          request.sendOverlay();
        });
    }
  }

}
