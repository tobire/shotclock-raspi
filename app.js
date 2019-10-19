const START_TIME = 30;

var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
server.listen(8060);

app.use(express.static('public'))

var io = require('socket.io')(server);
nsp = io.of('/socket');

var clockRunning = true;
var timerId;
restartClock();

nsp.on('connection', function (socket) {
    console.log('New Connection');

    socket.on('resumepause', function () {
        console.log("Resume/Pause");
        clockRunning = !clockRunning;
    });
    socket.on('reset', function () {
        console.log("Reset & Start");
        stopTimer();
        clockRunning = true;
        restartClock();
    });
});

function restartClock() {
    var clock = START_TIME;
    emitTime(clock);
    timerId = setInterval(function () {
        if (clockRunning) {
            emitTime(--clock);
            if (clock <= 0) {
                stopTimer();
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
}

function emitTime(time) {
    nsp.emit('time', time);
    console.log(time);
}