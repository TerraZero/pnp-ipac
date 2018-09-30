const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuidv1 = require('uuid/v1');

global.sys = {};

sys.Logger = require('./server/Logger');
sys.Request = require('./server/Request');

const Database = require('./server/Database');
const Storage = require('./server/Storage');

const log = new sys.Logger('System');
sys.db = new Database(new sys.Logger('DB'));
sys.storage = new Storage(new sys.Logger('storage'));

sys.loadData = function (name) {
  const path = './server/data/' + name + '.json';

  delete require.cache[require.resolve(path)];
  return require(path);
};

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/web/' + req.url);
});

http.listen(3000, function () {
  log.log('listening on *:3000');
});

sys.db.init()
  .then(sys.storage.setup.bind(sys.storage))
  .then(() => {
    io.on('connection', (socket) => {
      let device = null;

      socket.on('register', async (args) => {
        if (args.meta.uuid === null) {
          args.meta.uuid = uuidv1();
          log.log('New device uuid created with uuid [0]', args.meta.uuid);
        } else {
          log.log('Login device with uuid [0]', args.meta.uuid);
        }
        device = sys.storage.getDevice(args.meta.uuid, socket);
        const request = new sys.Request('register', device, args);

        request.sendMeta(args.meta);

        if (device._data.user === null) {
          request.sendForm('LoginForm');
        }
      });

      socket.on('submit', (args) => {
        const request = new sys.Request('submit', device, args);

        log.log('Submit form [0]', args.vue.data.form);
        const form = require('./server/form/' + args.vue.data.form);

        form.submit(request);
      });
    });

    log.log('Ready');
  });