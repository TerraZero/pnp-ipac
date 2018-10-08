module.exports = class SkillSubmit {

  static userUpdate(request) {
    const frame = request.getFrame('update');
    const user = request.user();

    Promise.all([
      sys.storage.updatePoints(user, user.points - frame.state.costs),
      sys.storage.updateSkill(user, frame.current.key, frame.current.value + frame.state.delta),
    ])
      .then(() => {
        request.sendPage('Skills');
      });
  }

}
