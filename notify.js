//requrie modules here
function notify(){
}

var restDB = {};


notify['list'] = {
	store :{
		"DemoChannel" : []
	}
}

notify.wsServer = function(){
	var express = require("express");
	var app = express();
	var srvr = app.listen(6000);
	console.log("ws server started");
	var io = require('socket.io').listen(srvr);
	return io;
}

notify.restServer = function(){
	var express = require("express");
	var app = express();
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json())
	app.listen(7000);
	console.log("rest server started");
	return app;
}

notify.prototype.init = function(argument){
		notify.prototype.ws = notify.wsServer();
		notify.prototype.ws['addLChannel'] = notify.wsAddLChannel;
		notify.prototype.ws['addPChannel'] = notify.wsAddPChannel;
		notify.prototype.rest = notify.restServer();
		notify.prototype.rest['addLChannel'] = notify.restAddLChannel;
		notify.prototype.rest['addPChannel'] = notify.restAddPChannel;
};

notify.wsAddLChannel = function(){
	console.log("listener channel on ws created")
}

notify.wsAddPChannel = function(){
	console.log("Publisher channel on ws created")
}

notify.restAddLChannel = function(topic, fn){

	console.log("listener channel on rest created")
	notify['list']['store'][topic] = [notify.rest];
	var app = notify.rest;
	var response = app.post('/'+topic, function(req, resp){
		return resp;
	})
	restDB[topic] = response;
	console.log("restDB = ", restDB);

}

notify.restAddPChannel = function(topic){
	console.log("Publisher channel on rest created");
}

module.exports = notify;
