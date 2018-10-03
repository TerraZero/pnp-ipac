module.exports = class Stages {

  static build(request) {
    return Promise.resolve({
      display: 'stages',
      data: sys.loadData('scene'),
    });
  }

}
