
//requrie modules here
module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocol){ 		//listnerProtocol => 'rest', publisherProtocol => 'ws'
			var savedServers = {
				ws:null,
				mqtt:null,
				rest:null
			}
			// each protocol server implementation
			function wsListner(config){
				if(savedServers['ws']){
					return savedServers['ws']
				}
				else{
					var express = require("express");
					var app = express();
					var srvr = app.listen(6000);
					console.log("ws server started");
					var io = require('socket.io').listen(srvr);
					savedServers['ws'] = app
					return app;
				}
			}
			function wsPublisher(config){

			}
			function wsLChannel(config){

			}
			function wsPChannel(config){

			}
			function restListner(config){
				if(savedServers['rest']){
					return savedServers['rest']
				}
				else{
					var express = require("express");
					var app = express();
					var bodyParser = require('body-parser');
					app.use(bodyParser.urlencoded({ extended: false }));
					// parse application/json
					app.use(bodyParser.json())
					app.listen(7000);
					console.log("rest server started");
					savedServers['rest'] = app
					return app;
				}
			}
			function restPublisher(config){

			}
			function restLChannel(config){

			}
			function restPChannel(config){

			}

			function initListeners(topic, listnerProtocols){
				listnerProtocols.forEach((lProtocol)=>{
					
				})
			}
			function initPublishers(topic, publisherProtocols){
				publisherProtocols.forEach((pProtocol)=>{

				})
			}
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	}
}
