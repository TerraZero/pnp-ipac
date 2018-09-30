module.exports = class RegisterForm {

  static build(request) {
    const features = sys.loadData('features');

    const build = {
      form: 'RegisterForm',
      title: 'Register',
      fields: {
        age: {
          label: 'Alter',
          value: '',
        },
        gender: {
          label: 'Geschlecht',
          value: 'male',
          options: {
            male: 'Männlich',
            female: 'Weiblich',
          }
        },
      },
      buttons: {
        submit: {
          text: 'Register',
          classes: ['button--submit'],
        },
      },
    };

    for (const index in features) {
      build.fields[index] = {
        label: features[index].name + ' (' + features[index].symbol + ')',
        value: features[index].base,
      }
    }

    return build;
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
    if (!data.fields.age.error && (age + '' != data.fields.age.value || age < 20 || age > 60)) {
      error = true;
      data.fields.age.error = {
        text: 'Alter muss eine Zahl von 20 - 60 sein.',
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
      .then(function () {
        request.sendPage('Skills');
      });
  }

}
