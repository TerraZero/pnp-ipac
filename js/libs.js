function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function enterFullScreen() {
  var funcRequestFullScreen = document.body.requestFullScreen || document.body.webkitRequestFullScreen || document.body.mozRequestFullScreen || document.body.msRequestFullScreen || null;

  if (funcRequestFullScreen) {
    funcRequestFullScreen.call(document.body);
  }
}

function exitFullScreen() {
  var funcExitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msExitFullscreen || null;

  if (funcExitFullscreen) {
    funcExitFullscreen.call(document);
  }
}

function getRandom(min, max) {
  return Math.round((Math.random() * (max - min)) + min);
}

function getOptionsRandom(definition) {
  var options = [];

  for (var name in definition) {
    options.push(name);
  }
  return options[getRandom(0, options.length - 1)];
}
