module.exports = class Stages {

  static build(request) {
    return Promise.resolve({
      display: 'stages',
      data: {
        select: null,
        stages: sys.loadData('stages'),
      },
    });
  }

}
