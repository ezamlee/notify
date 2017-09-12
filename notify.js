
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocols){ 		//listnerProtocol => ['ws','rest'], publisherProtocols => ['ws','rest']

			var servers = {
				ws:null,
				mqtt:null,
				rest:null
			}

			function getServer(protocol){
				console.log(servers);
				if(servers[protocol]){
					console.log("server returned");
					return this.server[protocol]
				}else{
					var express = require("express");
					var app = express();
					app.listen(6600);
					console.log("server created");
					return app;
				}
			}
			// each protocol server implementation
			var server = {
				ws:{
					listner     : function(config){
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
						return getServer("rest")
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
