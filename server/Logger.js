module.exports = class Logger {

  constructor(namespace, config = null) {
    this._ns = namespace.toUpperCase();
    this._config = config || {};
  }

  replacer(text = '', args = []) {
    for (const index in args) {
      text = text.replace(new RegExp('\\[' + index + '\\]', 'g'), '"' + args[index] + '"');
    }
    return text;
  }

  debug(text, ...args) {
    if (this._config.debug === false) return;
    text = this.replacer(text, args);
    console.log('DEBUG', this._ns + ':', text);
  }

  log(text, ...args) {
    if (this._config.log === false) return;
    text = this.replacer(text, args);
    console.log(this._ns + ':', text);
  }

  warn(text, ...args) {
    if (this._config.warn === false) return;
    text = this.replacer(text, args);
    console.log('WARN', this._ns + ':', text);
  }

  error(text, error = null, ...args) {
    if (this._config.error === false) return;
    text = this.replacer(text, args);
    console.log('ERROR', this._ns + ':', text);
    if (error) {
      console.log(error);
    }
  }

}
