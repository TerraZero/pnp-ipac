module.exports = class Menu {

  static build(request) {
    const menu = request.menu();
    const args = request.args();

    if (args && args.level === 'second') {
      request.sendPage(args.button.type);
    }

    return {
      first: this.first(request, menu),
      second: this.second(request, menu),
    };
  }

  static first(request, menu) {
    return {
      select: menu && menu.first.select || null,
      buttons: {
        scenes: {
          type: 'scene',
          icon: 'stage',
          text: 'Scene',
        },
        users: {
          type: 'users',
          icon: 'social',
          text: 'Users',
        },
      },
    };
  }

  static second(request, menu) {
    if (menu && menu.first.select) {
      return this[menu.first.select](request, menu);
    }
    return null;
  }

  static users(request, menu) {
    const second = {
      select: menu && menu.second && menu.second.select || null,
      buttons: {},
    };

    const devices = sys.storage.devices();

    for (const index in devices) {
      const user = devices[index].user();

      if (user) {
        second.buttons[user.name] = {
          type: 'User',
          user: user.name,
          text: user.name,
        };
      }
    }

    return second;
  }

  static scene(request, menu) {
    const second = {
      select: menu && menu.second && menu.second.select || null,
      buttons: {
        stages: {
          type: 'Stages',
          text: 'Stages',
        },
        sounds: {
          type: 'Sounds',
          text: 'Sounds',
        },
        chapters: {
          type: 'Chapters',
          text: 'Chapters',
        },
      },
    };

    return second;
  }

}
