var notifications = require("./notification");
var topics = require("./topics");

//requrie modules here
function notify() {

}
notify['db'] = {

}

notify['list'] = {
	store: {
		"DemoChannel": [],
	}
}

notify.applyOnTopic = {}

notify.wsServer = function () {
	var app = require('express')();
	var http = require('http').Server(app);

	var socket = require('socket.io')(http);
	socket.on('connection', function (socket) {

		socket.on("set", function (data) {
			if (data.topics && data.topics.constructor === Array && data.topics.length > 0) {
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

	http.listen(9000)
	return socket;
}

notify.restServer = function () {
	var express = require("express");

	var cors = require('cors');
	var app = express()
	app.use(cors())

	var bodyParser = require('body-parser');
	//support parsing of application/json type post data
	app.use(bodyParser.json());
	//support parsing of application/x-www-form-urlencoded post data
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.listen(7000);
	return app;
}

notify['create_mongo_connection'] = function (mongoHost, MongoPort, Database) {
	var mongoose = require('mongoose');
	// mongoose.connect("mongodb://127.0.0.1:27017/NodeProject");
	var mongoDB = 'mongodb://' + mongoHost + ':' + MongoPort + '/' + Database;
	mongoose.connect(mongoDB);
}
notify.wsAddLChannel = function (topic, fn) {
	notify.applyOnTopic[topic] = fn
	var socket = notify.ws;

	socket.on('connection', function (socket) {
		socket.on("listner", function (data) {
			notifications.collection.insert({
				'topic': data.topic,
				'ts': Math.floor(Date.now()),
				'notification': notify.applyOnTopic[data.topic](data.notification)
			})
			socket.to(data.topic).emit('serverpublisher', {
				'topic': data.topic,
				'ts': Math.floor(Date.now()),
				'notification': notify.applyOnTopic[data.topic](data.notification)
			})
		})
	});
}
notify.wsAddPChannel = function (topic) {
	var socket = notify.ws;
	socket.on('connection', function (socket) {
		socket.on('clientpublisher', function (data) {
			if (data.topic && data.from == undefined && data.to == undefined) {
				notifications.find({
					'topic': data.topic
				}, (err, data2) => {
					socket.emit('response', data2);
				})
			} else if (data.topic && data.from != undefined && data.to == undefined) {
				notifications.find({
					'topic': data.topic,
					"ts": {
						$gte: data.from
					}
				}, (err, data) => {
					socket.emit("response", data);
				})
			} else if (data.topic && data.from != undefined && data.to != undefined) {
				notifications.find({
					'topic': data.topic,
					"ts": {
						$gte: data.from,
						$lte: data.to
					}
				}, (err, data) => {
					socket.emit("response", data);
				})
			}
		})
	})
}
notify.restAddLChannel = function (topic, fn) {
	
	notify.rest.post('/' + topic, function (req, resp) {
		console.log("req.body", req.body);
		topics.findOne({
			'topic': topic
		}, (err, data) => {
			if (!data) {
				topics.collection.insert({
					'topic': topic
				});
			}
		})

		notifications.collection.insert({
			'topic': topic,
			'ts': Math.floor(Date.now()),
			'notification': fn(req.body),
			'notification': fn({
				"notification": {
					"status": req.body.status,
					"mydata": req.body.mydata,
					"title": req.body.title
				}
			}),
			"params": req.params,
			"query": req.query,
			"body": req.body,
			'method': req.method,
			'headers': req.headers
		})
		notify.ws.to(topic).emit('serverpublisher', fn({
			"notification": {
				"status": req.body.status,
				"mydata": req.body.mydata,
				"title":req.body.title
			}
		}))
		resp.status('200').send("success")
	})
}
notify.restAddPChannel = function (topic) {
	notify.rest.post(`/response/` + topic, function (req, resp) {
		notifications.find({
			'topic': topic
		}, (err, data) => {
			resp.send(data);
		})
	})


	notify.rest.post(`/response/` + topic + "/:from", function (req, resp) {
		notifications.find({
			'topic': topic,
			"ts": {
				$gte: req.params.from
			}
		}, (err, data) => {
			resp.send(data);
		})
	})

	notify.rest.post(`/response/` + topic + "/:from" + "/:to", function (req, resp) {
		notifications.find({
			'topic': topic,
			"ts": {
				$gte: req.params.from,
				$lte: req.params.to
			}
		}, (err, data) => {
			resp.send(data);
		})
	})
}

notify.init = function (mongoHost, MongoPort, Database) {
	notify.ws = notify.wsServer();
	notify.ws['addLChannel'] = notify.wsAddLChannel;
	notify.ws['addPChannel'] = notify.wsAddPChannel;
	notify.rest = notify.restServer();
	notify.rest['addLChannel'] = notify.restAddLChannel;
	notify.rest['addPChannel'] = notify.restAddPChannel;
	notify.mongo = notify.create_mongo_connection(mongoHost, MongoPort, Database)
};
notify.make = function (channel, fn) {
	notify.ws.addLChannel(channel, fn)
	notify.ws.addPChannel(channel)
	notify.rest.addPChannel(channel)
	notify.rest.addLChannel(channel, fn)
}
module.exports = notify;
