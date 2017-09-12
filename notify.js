
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocols){ 		//listnerProtocol => ['ws','rest'], publisherProtocols => ['ws','rest']

			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}
			var lChannel = [];
			var pChannel = [];

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
						console.log("server created");
						server[protocol] = app
						return app;
					}
					else if (protocol == 'ws') {
						var express = require("express");
						var app = express();
						var srvr = app.listen(6000);
						var io = require('socket.io').listen(srvr);
						console.log("server created");
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
					addLChannel : function(config){ //config = {'topic': topic}
						lChannel.push(config['topic'])
						return lChannel
					},
					addPChannel : function(config){
						pChannel.push(config['topic'])
						return pChannel
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
			// server.rest.listner({});
			server.rest.publisher({'route':'users'});
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	}
}
