var app = require('express')();
var http = require('http').Server(app);
var rp = require('request-promise');
var SocketServer = require('http').createServer();
var socket = require('socket.io')(SocketServer);
var cors = require('cors');
var bodyParser = require('body-parser');

http.listen(7000)
SocketServer.listen(9000)

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post("/:sid", (req, resp) => {
    var time = req.body.time || null;
    var msg = req.body.msg || null;
    var status = req.body.status || null;
    var source = req.body.source || null;
    var sid = req.params.sid || null;
    var locLat = req.body.locLat || null;
    var locLong = req.body.locLong || null;
    var locDesc = req.body.locDesc || null;
    var driverPhone = req.body.driverPhone || "Not Avaliable";
    var driverName = req.body.driverName || "Not Avaliable";
    var speed = req.body.speed || "Not Avaliable";

    if (time && msg && status &&
        source && sid && locDesc &&
        locLat && locLong && driverName &&
        driverPhone && speed) {
        rp({
                uri: `http://localhost:3000/api/notifications`,
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: {
                    "time": time,
                    "msg": msg,
                    "status": status,
                    "source": source,
                    "sid": sid,
                    "locDesc": locDesc,
                    "locLat": locLat,
                    "locLong": locLong,
                    "driverName": driverName,
                    "driverPhone": driverPhone,
                    "speed" : speed
                },
                json: true
            })
            .then((dbresp) => {
                socket.to(sid).emit('serverpublisher', dbresp);
                resp.status(200).json({
                    "msg": "success"
                })
            }).catch((err) => {
                resp.status(200).json({
                    "msg": "failed",
                    "error": err
                })
            })

    } else {
        resp.status(200).json({
            "msg": "failed",
            "error": "unable to save the message"
        })
    }


})

//Socket Routes
socket.on('connection', function (socket) {

    socket.on("set", function (data) {
        if (data.topics && data.topics.constructor === Array && data.topics.length > 0) {
            console.log(data.topics);
            data.topics.forEach((topic) => {
                socket.join(topic)
            })
        }
    })
    socket.on("castUp", function (data) {
        socket.broadcast.emit("castDo", {
            "action": "update_rooms"
        })
    })
});
