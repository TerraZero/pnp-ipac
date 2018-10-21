module.exports = class Scene {

  static build(request) {
    return Promise.resolve({
      display: 'scene',
      data: {
        select: null,
        stages: sys.loadData('stages'),
      },
    });
  }

}
