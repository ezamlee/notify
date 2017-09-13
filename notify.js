
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocols,publisherProtocols){ 		//listnerProtocols => ['ws','rest'], publisherProtocols => ['ws','rest']

			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}
			var lChannel = [];
			var pChannel = [];
			listnerProtocols =['ws','rest'];
			publisherProtocols = ['ws','rest'];

			function getServer(protocol){
				console.log(servers);
				if(servers[protocol]){
					console.log("server returned");
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
						console.log("rest server created");
						server[protocol] = app
						return app;
					}
					else if (protocol == 'ws') {
						var express = require("express");
						var app = express();
						var srvr = app.listen(6000);
						var io = require('socket.io').listen(srvr);
						console.log("ws server created");
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
						var app = getServer("rest");
						app.post('/', function(req,resp){
							console.log("post request " );
						})
					},
					addLChannel : function(config){ //config = {'route': route}
						console.log("config = ", config);
						lChannel.push(config['route'])
						console.log("lChannel= ", lChannel);
						return lChannel
					},
					addPChannel : function(config){
						pChannel.push(config['route']);
						console.log("pChannel= ", pChannel);
						return pChannel
					}
				}
			}
			var initListeners = (config)=>{ // config => {'protocol':'', 'route':''}
				console.log(config);
				console.log(listnerProtocols);

				listnerProtocols.forEach((lProtocol)=>{
					console.log("lProtocoll",lProtocol);
					if (config['protocol'] == lProtocol) {
						console.log("they equal");
						server[lProtocol].listner(
							{
								//enter configuration here
							}
						)
						server[lProtocol].addLChannel({'route':'/notification'})
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
			return initListeners({'protocol':'rest', 'route': '/notificaction'})
			// server.rest.addLChannel({'route':'/notification'});
			// server.rest.publisher({'route':'users'});
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	}
}
