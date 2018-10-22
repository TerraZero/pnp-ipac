module.exports = class Stages {

  static build(request) {
    const names = [
      'bg_video',
      'images',
      'music',
      'narrator',
      'sound',
      'texts',
    ];

    const stages = [];

    for (const name of names) {
      for (const item of sys.loadData('stages/' + name)) {
        stages.push(item);
      }
    }

    return Promise.resolve({
      display: 'stages',
      data: {
        select: null,
        stages: stages,
      },
    });
  }

}
