module.exports = class Menu {

  static built(request) {
    const menu = request.menu();

    return {
      first: this.first(request, menu),
      second: this.second(request, menu),
    };
  }

  static first(request, menu) {
    return {
      select: menu && menu.first.select || null,
      buttons: {
        stages: {
          type: 'stages',
          icon: 'stage',
          text: 'Stages',
        },
        sounds: {
          type: 'sounds',
          icon: 'sound',
          text: 'Sounds',
        },
        users: {
          type: 'users',
          icon: 'social',
          text: 'Users',
        },
        chat: {
          type: 'chat',
          icon: 'chat',
          text: 'Chat',
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

      second.buttons[user.name] = {
        type: user.name,
        text: user.name,
      };
    }

    return second;
  }

}
