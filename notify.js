
//requrie modules here

module.exports = {
	factory : function(topic,listnerProtocol,publisherProtocols){ 		//listnerProtocol => ['ws','rest'], publisherProtocols => ['ws','rest']
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
	},
	list : {
		store :{
			"DemoChannel" : []
		}
	},
	servers : {
		ws:null,
		mqtt:null,
		rest:null
	}
}
