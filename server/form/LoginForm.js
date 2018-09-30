module.exports = class LoginForm {

  static build(request) {
    return {
      form: 'LoginForm',
      title: 'Login',
      fields: {
        user: {
          label: 'Username',
          value: '',
        },
      },
      buttons: {
        submit: {
          text: 'Login',
          classes: ['button--submit'],
        },
      },
    };
  }

  static submit(request) {
    const data = request.getData();

    if (!data.fields.user.value) {
      data.fields.user.error = {
        text: 'Required',
      };
      return request.resend('Form error.');
    }

    const meta = request.getMeta();

    meta.user = request.getData().fields.user.value;
    request.sendMeta(meta);
    const user = sys.storage.getUser(request);

    if (user === null) {
      request.sendForm('RegisterForm');
    } else {
      request.sendPage('Skills');
    }
  }

}
