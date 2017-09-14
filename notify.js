//requrie modules here
function notify(){
}


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
	// parse application/json
	app.use(bodyParser.json())
	app.listen(7000);
	console.log("rest server started");
	return app;
}

notify.init = function(argument){
	notify['ws'] = notify.wsServer();
	notify.ws['addLChannel'] = notify.wsAddLChannel;
	notify.ws['addPChannel'] = notify.wsAddPChannel;
	notify['rest'] = notify.restServer(); 
	notify.rest['addLChannel'] = notify.restAddLChannel;
	notify.rest['addPChannel'] = notify.restAddPChannel;
};

notify.wsAddLChannel = function(){
	console.log("listener channel on ws created")
}
notify.wsAddPChannel = function(){
	console.log("Publisher channel on ws created")

}
notify.restAddLChannel = function(){
	console.log("listener channel on rest created")

}
notify.restAddPChannel = function(){
	console.log("Publisher channel on rest created")
}
module.exports = notify;

