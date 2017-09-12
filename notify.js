
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocols){ 		//listnerProtocol => ['ws','rest'], publisherProtocols => ['ws','rest']

			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}

			function getServer(protocol, config){
				console.log(servers);
				if(servers[protocol]){
					console.log("server returned");
					return servers[protocol]
				}else{

					var express = require("express");
					var app = express();

					if (protocol == 'rest') {
						app.listen(config.port);
						console.log("server created on port " + config.port );
					}
					else if (protocol == 'ws') {
						var srvr = app.listen(config.port);
						var io = require('socket.io').listen(srvr);
						console.log("server created on port " + config.port );
					}

					server[protocol] = app
					return app;

				}

			}
			// each protocol server implementation
			var server = {
				ws:{
					listner     : function(config){
						return getServer('ws', {'port':6000})
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
						return getServer("rest", {'port':6600})
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
				}
			}
			var initListeners = (listnerProtocol)=>{
				listnerProtocol.foreach((protocol)=>{
					server[protocol].listner(
						{
							//enter configuration here
						}
					)
					server[protocol].addLChannel(
						{
							//enter configuration here
						}
					)
				})
			}
			var initPublishers = (publisherProtocols)=>{
				publisherProtocols.foreach((protocol)=>{
					this.server[protocol].publisher(
						{
							//enter configuration here
						}
					)
					this.server[protocol].addPChannel(
						{
							//enter configuration here
						}
					)
				})
			}
			server.rest.listner({});
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	}
}
