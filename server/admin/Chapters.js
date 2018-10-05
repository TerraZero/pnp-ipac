module.exports = class Chapters {

  static build(request) {
    return Promise.resolve({
      display: 'chapters',
      data: {
        select: null,
        chapters: sys.loadData('chapters'),
      },
    });
  }

}
