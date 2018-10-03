module.exports = class Skills {

  static get layout() {
    return 'skills';
  }

  static build(request) {
    const data = request.getData();

    return sys.storage.getSkills(request.user())
      .then((skills) => {
        skills.select = data && data.select || 'character';
        skills.menu = {
          character: {
            name: 'Charakter',
            icon: 'character',
            key: 'character',
          },
        };
        for (const skillPage in skills.skills) {
          skills.menu[skillPage] = {
            name: skills.skills[skillPage].name,
            icon: skills.skills[skillPage].icon,
            key: skillPage,
          };
        }
        skills.menu.specifics = {
          name: 'Besonderheiten',
          icon: 'dna',
          key: 'specifics',
        };

        for (const key in skills.specifics) {
          skills.specifics[key].open = false;
        }
        return skills;
      });
  }

}
