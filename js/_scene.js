const socket = io();

const data = {
  data: null,
  loading: true,
};

const app = new Vue({
  el: '#app',
  data: data,
});

function send(event, args, loading) {
  if (loading !== false) {
    data.loading = true;
  }
  socket.emit(event, {
    vue: data,
    args: args || null,
  });
}

socket.on('update:data', function (args) {
  data.data = args.data;
});

send('scene:register');
