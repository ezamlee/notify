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

notify['create_mongo_connection'] = function(mongoHost,MongoPort,Database,Collection) {
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/my_database'); 

	return mongoose;
}

notify.init = function(mongoHost,MongoPort,Database,Collection){
		notify.ws = notify.wsServer();
		notify.ws['addLChannel'] = notify.wsAddLChannel;
		notify.ws['addPChannel'] = notify.wsAddPChannel;
		notify.rest = notify.restServer();
		notify.rest['addLChannel'] = notify.restAddLChannel;
		notify.rest['addPChannel'] = notify.restAddPChannel;
		notify.mongo = notify.create_mongo_connection(mongoHost,MongoPort,Database,Collection)
};


notify.wsAddLChannel = function(){
	console.log("listener channel on ws created")
}

notify.wsAddPChannel = function(){
	console.log("Publisher channel on ws created")
}

notify.restAddLChannel = function(topic, fn){

	console.log("listener channel on rest created")
	notify.rest.post('/'+topic, function(req, resp){
		if(!notify.db[topic]){
			notify.db[topic] = {}
		}
		notify.db[topic][Math.floor(Date.now())] = {
			"Notification": fn(req.body) , 
			'req':{
				'method':req.method,
				'headers':req.headers,
				'HttpVersion':req.httpVersion,
				'params':req.params,
				'query':req.query,
				'body':req.body
			}
		}
		resp.status('200').send("success")
	})
}

notify.restAddPChannel = function(topic){
	console.log("Publisher channel on rest created");

	notify.rest.post('/response/'+topic, function(req, resp){
		console.log(notify.db[topic])
		resp.send(notify.db[topic])
	})

	notify.rest.post('/response/'+topic + "/:from", function(req, resp){
		var temp_arr = [];

		Object.keys(notify.db[topic]).map((NotificationDate,index)=>{
			if(NotificationDate >= req.params.from){
				temp_arr.push(notify.db[topic][NotificationDate])
			}
			if(index == Object.keys(notify.db[topic]).length -1){
				resp.send(temp_arr)
			}
		})

	})

	notify.rest.post('/response/'+topic + "/:from"+"/:to", function(req, resp){
		var temp_arr = [];

		Object.keys(notify.db[topic]).map((NotificationDate,index)=>{
			if(NotificationDate >= req.params.from && NotificationDate <= req.params.to &&  req.params.to > req.params.from){
				temp_arr.push(notify.db[topic][NotificationDate])
			}
			if(index == Object.keys(notify.db[topic]).length -1){
				resp.send(temp_arr)
			}
		})

	})
}

module.exports = notify;
