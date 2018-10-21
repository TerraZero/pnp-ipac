module.exports = class Menu {

  static build(request) {
    const menu = request.menu();
    const args = request.args();

    if (args && args.level === 'second') {
      request.sendPage(args.button.type);
    }

    if (args && args.level === 'first' && args.button.type === 'scene') {
      request.sendPage('Scene');
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

    const users = sys.storage.users();

    for (const index in users) {
      const user = users[index];

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
      buttons: {},
    };

    return second;
  }

}
