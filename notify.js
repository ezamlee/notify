
var notifications = require("./notification");
var topics = require("./topics");

//requrie modules here
function notify(){

}
notify['db'] = {

}

notify['list'] = {
	store :{
		"DemoChannel" : [],
	}
}

notify.wsServer = function(){
	var express = require("express");
	var app = express();
	var srvr = app.listen(6000);
	console.log("ws server started");
	var app = express();
	//application setting
	app.set("view engine", "ejs");
	app.set("views", "./views");
	app.get("/",function(req,resp){
		resp.render("index");
	})
	var io = require('socket.io').listen(srvr);
	return io;
}

notify.restServer = function(){
	var express = require("express");
	var app = express();
	var bodyParser = require('body-parser');
	//support parsing of application/json type post data
	app.use(bodyParser.json());
	//support parsing of application/x-www-form-urlencoded post data
	app.use(bodyParser.urlencoded({ extended: true }));

	app.listen(7000);
	console.log("rest server started");
	return app;
}

notify['create_mongo_connection'] = function(mongoHost,MongoPort,Database) {
	var mongoose = require('mongoose');
	// mongoose.connect("mongodb://127.0.0.1:27017/NodeProject");
	var mongoDB = 'mongodb://' + mongoHost + ':'+MongoPort +'/'+ Database;
	mongoose.connect(mongoDB);

}

notify.init = function(mongoHost,MongoPort,Database){
		notify.ws = notify.wsServer();
		notify.ws['addLChannel'] = notify.wsAddLChannel;
		notify.ws['addPChannel'] = notify.wsAddPChannel;
		notify.rest = notify.restServer();
		notify.rest['addLChannel'] = notify.restAddLChannel;
		notify.rest['addPChannel'] = notify.restAddPChannel;
		notify.mongo = notify.create_mongo_connection(mongoHost,MongoPort,Database)
};


notify.wsAddLChannel = function(topic, fn){
	console.log("listener channel on ws created");
	notify.ws.on('connection', function (socket) {
		console.log("socket = ", socket);
	});
}

notify.wsAddPChannel = function(){
	console.log("Publisher channel on ws created")
}

notify.restAddLChannel = function(topic, fn){
	console.log("listener channel on rest created");
	notify.rest.post('/'+topic, function(req, resp){
		topics.findOne({'topic': topic}, (err, data)=>{
			if (!data) {
				topics.collection.insert({'topic': topic});
			}
		})

		notifications.collection.insert({
			'topic': topic,
			'ts': Math.floor(Date.now()),
			'notification': fn(req.body),
			'HttpVersion': String,
			"params": req.params,
			"query": req.query,
			"body": req.body,
			'method':req.method,
			'headers':req.headers

		})

		resp.status('200').send("success")
	})
}

notify.restAddPChannel = function(topic){
	console.log("Publisher channel on rest created");

	notify.rest.post('/response/'+topic, function(req, resp){
		notifications.find({},(err,data) => {
	    resp.send(data);
	  })
	})

	notify.rest.post('/response/'+topic + "/:from", function(req, resp){

		notifications.find({"ts": {$gte: req.params.from}}, (err, data)=>{
			resp.send(data);
		})

	})

	notify.rest.post('/response/'+topic + "/:from"+"/:to", function(req, resp){
		notifications.find({"ts": {$gte: req.params.from, $lte: req.params.to}}, (err, data)=>{
			resp.send(data);
		})
	})
}

module.exports = notify;
