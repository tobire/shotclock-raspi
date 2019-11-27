const START_TIME = 30;
const FONTS = ["SevenSegment", "Cocksure"];

var express = require("express");
var http = require("http");

var app = express();
var server = http.createServer(app);
server.listen(8060);

app.use(express.static("public"));

var io = require("socket.io")(server);
nsp = io.of("/socket");

var clockRunning = false;
var timerId;
var currentClockTime;
var currentScale = 1.0;
var currentFont = 0;

restartClock();

nsp.on("connection", function(socket) {
  console.log("New Connection");
  socket.emit("time", currentClockTime);
  nsp.emit("font", FONTS[currentFont]);

  socket.on("resumepause", function() {
    console.log("Resume/Pause");
    clockRunning = !clockRunning;
  });
  socket.on("reset", function() {
    console.log("Reset & Start");
    stopTimer();
    clockRunning = true;
    restartClock();
  });
  socket.on("scaleup", function() {
    changeScale(0.05);
  });
  socket.on("scaledown", function() {
    changeScale(-0.05);
  });
  socket.on("nextfont", function() {
    nextFont();
  });
  socket.on("refresh", function() {
    refreshBrowsers();
  });
});

function restartClock() {
  currentClockTime = START_TIME;
  emitTime(currentClockTime);
  timerId = setInterval(function() {
    if (clockRunning) {
      emitTime(--currentClockTime);
      if (currentClockTime <= 0) {
        stopTimer();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
}

function emitTime(time) {
  nsp.emit("time", time);
  console.log("time " + time);
}

function changeScale(adjustment) {
  currentScale = Math.round((currentScale + adjustment) * 100) / 100;
  nsp.emit("scale", currentScale);
  console.log("scale " + currentScale);
}

function nextFont() {
  currentFont = (currentFont + 1) % FONTS.length;
  nsp.emit("font", FONTS[currentFont]);
  console.log("font " + FONTS[currentFont]);
}

function refreshBrowsers() {
  nsp.emit("refresh");
  console.log("refresh browsers");
}
