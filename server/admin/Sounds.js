module.exports = class Sounds {

  static build(request) {
    const data = {
      sounds: [],
      musics: [],
    };

    for (const item of sys.loadData('sounds')) {
      if (item.type === 'sound') {
        data.sounds.push(item);
      }
      if (item.type === 'music') {
        data.musics.push(item);
      }
    }
    return Promise.resolve({
      display: 'sounds',
      data: data,
    });
  }

}
