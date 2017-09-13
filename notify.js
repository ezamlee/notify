
//requrie modules here

var lChannel = [];
var pChannel = [];
//listnerProtocols => ['ws','rest'], publisherProtocols => ['ws','rest']
var listnerProtocols =['ws','rest'];
var publisherProtocols = ['ws','rest'];


module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocol){ 		//listnerProtocol => 'rest', publisherProtocol => 'ws'
			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}

			function getServer(protocol){
				if(servers[protocol]){
					return servers[protocol]
				}else{

					if (protocol == 'rest') {
						var express = require("express");
						var app = express();
						var bodyParser = require('body-parser');
						app.use(bodyParser.urlencoded({ extended: false }));
						// parse application/json
						app.use(bodyParser.json())
						app.listen(7000);
						server[protocol] = app
						return app;
					}
					else if (protocol == 'ws') {
						var express = require("express");
						var app = express();
						var srvr = app.listen(6000);
						var io = require('socket.io').listen(srvr);
						server[protocol] = app
						return app;
					}

				}

			}
			// each protocol server implementation
			var server = {
				ws:{
					listner     : function(config){
						return getServer('ws')
						//return server
					},
					publisher   : function(config){
						//return server
					},
					addLChannel : function(config){
						//return server
					},
					addPChannel : function(config){
						//return server
					}
				},
				rest:{
					listner     : function(config){
						//return server
						return getServer("rest")
					},
					publisher   : function(config){
						//return server
					},
					addLChannel : function(topic){
						console.log("topic = ", topic);
						lChannel.push(topic);
						return lChannel
					}
					// ,
					// addPChannel : function(topic){
					// 	pChannel.push(topic);
					// 	return pChannel
					// }
				}
			}
			var initListeners = (topic, listnerProtocol)=>{
				console.log("listnerProtocols", listnerProtocols);
				listnerProtocols.forEach((lProtocol)=>{
					if (listnerProtocol == lProtocol) {
						console.log("if(listnerProtocol == lProtocol)");
						console.log("topic = ", topic);
						server[lProtocol].listner({})
						server[lProtocol].addLChannel(topic)
					}
				})
			}
			var initPublishers = (publisherProtocols)=>{
				publisherProtocols.forEach((pProtocol)=>{

					this.server[pProtocol].publisher(
						{
							//enter configuration here

						}
					)
					this.server[pProtocol].addPChannel(
						{
							//enter configuration here

						}
					)
				})
			}
			initListeners(topic,listnerProtocol)
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	}
}
