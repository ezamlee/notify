var express = require("express");
var cors = require('cors');
var app = express();
app.use(cors());
var bodyParser = require('body-parser');
let notify = require('./notify.js');
notify.init('127.0.0.1', '27017', 'newDB')
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(13456);

app.post("/register/:channel",function(req,resp){
	notify.make(req.params.channel,eval("(" + req.body.fn + ")"));
	resp.send("success")
})
