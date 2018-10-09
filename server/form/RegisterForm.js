module.exports = class RegisterForm {

  static build(request) {
    const professions = sys.loadData('professions');
    const features = sys.loadData('features');

    const build = {
      points: 20,
      form: 'RegisterForm',
      title: 'Register',
      fields: {
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
        profession: {
          label: 'Clan',
          value: '',
          options: {},
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
      };
    }

    for (const index in features) {
      build.fields[index] = {
        label: features[index].name + ' (' + features[index].symbol + ') [3 * d6]',
        value: '',
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
    };

    for (const feature in features) {
      user.features[feature] = data.fields[feature].value;
    }

    sys.storage.addUser(request, user)
      .then(function() {
        request._device.setUser(user);
        request.sendPage('Skills');
      });
  }

}
