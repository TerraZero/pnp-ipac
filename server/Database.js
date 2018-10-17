const fs = require('fs');
const sqlite3 = require('sqlite3');

const file = 'database/db.sql';

let log = null;

module.exports = class Database {

  constructor(logger) {
    log = logger;
    this._schema = require('./data/schema.json');
    this._new = false;
    this._db = null;
  }

  init() {
    log.log('init database');
    this._new = !fs.existsSync(file);
    if (!this._new) {
      fs.unlinkSync(file);
      this._new = true;
      log.debug('Delete existing database');
    }

    this._db = new sqlite3.Database(file);

    if (this._new) {
      return this.setup();
    } else {
      return Promise.resolve();
    }
  }

  setup() {
    log.log('setup database');
    const promises = [];

    for (const table in this._schema) {
      const fields = [];

      for (const field in this._schema[table]) {
        fields.push(field + ' ' + this._schema[table][field]);
      }
      promises.push(
        this.run('CREATE TABLE ' + table + ' (' + fields.join(', ') + ')')
          .then(() => {
            log.log('Setup table ' + table);
          })
      );
    }
    return Promise.all(promises);
  }

  run(statement, params) {
    return new Promise((resolve, reject) => {
      this._db.run(statement, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  get(statement, params) {
    return new Promise((resolve, reject) => {
      this._db.get(statement, params, function(err, row) {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(statement, params) {
    return new Promise((resolve, reject) => {
      this._db.all(statement, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  allKeyed(key, statement, params) {
    return sys.db.all(statement, params)
      .then(function(rows) {
        const data = {};

        for (const row of rows) {
          data[row[key]] = row;
        }
        return data;
      });
  }

  insert(table, values) {
    return this.run('INSERT INTO ' + table + ' VALUES (' + ('?, ').repeat(values.length - 1) + '?)', values);
  }

  update(table, where, values) {
    const sets = [];
    const wheres = [];
    const params = [];

    for (const index in values) {
      sets.push(index + ' = ?');
      params.push(values[index]);
    }

    for (const index in where) {
      wheres.push(index + ' = ?');
      params.push(where[index]);
    }

    params.push(where);
    return this.run('UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE ' + wheres.join(' AND '), params);
  }

  delete(table, where) {
    const wheres = [];
    const params = [];

    for (const index in where) {
      wheres.push(index + ' = ?');
      params.push(where[index]);
    }

    return this.run('DELETE FROM ' + table + ' WHERE ' + wheres.join(' AND '), params);
  }

}
