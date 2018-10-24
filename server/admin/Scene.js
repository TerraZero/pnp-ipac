module.exports = class Scene {

  static build(request) {
    const names = [
      'bg_video',
      'images',
      'layers',
      'music',
      'narrator',
      'sounds',
      'texts',
    ];

    const stages = [];

    for (const name of names) {
      for (const item of sys.loadData('stages/' + name)) {
        stages.push(item);
      }
    }

    return Promise.resolve({
      display: 'scene',
      data: {
        select: null,
        stages: stages,
      },
    });
  }

}
