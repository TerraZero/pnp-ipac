module.exports = class RegisterForm {

  static build(request) {
    const professions = sys.storage.getProfessions();
    const features = sys.loadData('features');

    const build = {
      points: 30,
      form: 'RegisterForm',
      title: 'Register',
      fields: {
        profession: {
          label: 'Clan',
          value: '',
          options: {},
        },
        age: {
          label: 'Alter [3 * d20 + 20]',
          value: '',
        },
        gender: {
          label: 'Geschlecht',
          value: 'male',
          options: {
            male: {
              value: 'Männlich',
            },
            female: {
              value: 'Weiblich',
            },
          }
        },
      },
      professions: professions,
      specifics: this.getSpecifics(),
      buttons: {
        submit: {
          text: 'Register',
          classes: ['button--submit'],
        },
      },
    };

    for (const profession in professions) {
      build.fields.profession.options[profession] = {
        value: professions[profession].name,
        description: professions[profession].description,
        image: professions[profession].image,
      };
    }

    for (const index in features) {
      if (features[index].show) {
        build.fields[index] = {
          label: features[index].name + ' (' + features[index].symbol + ') [3 * d6]',
          value: '',
        }
      }
    }
    console.log('send build');
    return build;
  }

  static getSpecifics() {
    const specifics = sys.loadData('specifics');

    for (const key in specifics) {
      specifics[key].open = false;
      specifics[key].active = false;
    }
    return specifics;
  }

  static submit(request) {
    const features = sys.loadData('features');
    const data = request.getData();
    let error = false;

    for (const name in data.fields) {
      const field = data.fields[name];
      delete field.error;

      if (!field.value) {
        error = true;
        field.error = {
          text: 'Required',
        };
      }
    }

    const age = parseInt(data.fields.age.value);
    if (!data.fields.age.error && (age + '' != data.fields.age.value || age < 20 || age > 80)) {
      error = true;
      data.fields.age.error = {
        text: 'Alter muss eine Zahl von 20 - 80 sein.',
      };
    }

    for (const index in features) {
      if (!features[index].show) continue;

      const field = data.fields[index];
      const number = parseInt(field.value);

      if (number + '' != field.value) {
        error = true;
        field.error = {
          text: field.label + ' muss eine Zahl sein.',
        };
      }
      field.value = number;
    }

    if (error) return request.resend('Form error.');

    const meta = request.getMeta();

    const user = {
      name: meta.user,
      age: data.fields.age.value,
      gender: data.fields.gender.value,
      features: {},
      profession: data.fields.profession.value,
    };

    for (const feature in features) {
      if (features[feature].show) {
        user.features[feature] = data.fields[feature].value;
      }
    }

    user.features.fight = (user.features.body + user.features.body + user.features.endurance) / 3;
    user.features.parade = (user.features.skill + user.features.skill + user.features.intelligence) / 3;

    sys.storage.addUser(request, user)
      .then(function() {
        request._device.setUser(user);
        request.sendPage('Skills');
      });
  }

}
