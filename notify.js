
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocols,publisherProtocols){ 		//listnerProtocols => ['ws','rest'], publisherProtocols => ['ws','rest']

			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}

			//please remove this varibles they should be passed dynamically to factory
			var lChannel = [];
			var pChannel = [];
			listnerProtocols =['ws','rest'];
			publisherProtocols = ['ws','rest'];
			///end of delete
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
						var app = getServer("rest");
						app.post('/', function(req,resp){
						})
					},
					addLChannel : function(config){ //config = {'route': route}
						lChannel.push(config['route'])
						return lChannel
					},
					addPChannel : function(config){
						pChannel.push(config['route']);
						return pChannel
					}
				}
			}
			var initListeners = (config)=>{ // config => {'protocol':'', 'route':''}

				listnerProtocols.forEach((lProtocol)=>{
					if (config['protocol'] == lProtocol) {
						console.log(lProtocol,server)
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
