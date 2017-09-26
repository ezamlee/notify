var express = require("express");
var app = express();
var bodyParser = require('body-parser');
let notify = require('./notify.js');
notify.init('127.0.0.1', '27017', 'newDB')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(13456);

app.post("/register/:channel",function(req,resp){
	notify.make(req.params.channel,eval("(" + req.body.fn + ")"));
	resp.send("success")
})

app.post("/reg/:user",function(req,resp){
	notify.make(req.params.user,function(data){
		return data.room
	});
	resp.send("success")
})
// notify.ws.addPChannel('javascript');
// notify.ws.addPChannel('Bootstrap');
