var fence = require("./fence");
var mail  = require("../mail/mail");
let express = require('express');
let router = express.Router();
let validator = require('validator');
var rp = require('request-promise');
var cors = require("cors");
let conf = require("../conf/serverconf");
let jwt = require("jsonwebtoken");
var host = conf.cycle == "dev" ? "localhost:9876" : "ec2-18-220-223-50.us-east-2.compute.amazonaws.com:9876"

/*
	  let id = obj.id           || null;
      let name = obj.name       || null;
      let locLat = obj.locLat   || null;
      let locLong = obj.locLong || null;
      let lecDesc = obj.locDesc || null;
      let r = obj.r             || 500;
*/
var userData = {
    "name": "Test User",
    "pass": "1234",
    "children": {},
    "loc": {
      "locLat": 40,
      "locLong": 40,
      "locDesc": "make you happy",
      "fence_id": 4
    },
    "nid": "1234",
    "secCode": "20033033716230",
    "passStatus": "blocked",
    "created_notification": false,
    "id": "5a646074e8bf5b4a046252c8",
    "email": "a.m.essam1992@gmail.com",
    "phone": "01100100255"
  }
var req = {}
req.body = {
	
    "email" :"a.m.essam1992@gmail.com"

}
        var mailToken = jwt.sign({
          nid: userData.nid ,
          name: userData.name ,
          phone :req.body.phone || userData.phone ,
          email: req.body.email || userData.email,
          type:"verify"
          }, conf.secretWord, {
            expiresIn: 172800
          }
        );
        mail.sendMessage({
           msg:`please verify your mail by going to http://${host}/verify?token=${mailToken}`
          ,html:
          `
            <p>Go to link to verify your account :
                <a href="http://${host}/verify?token=${mailToken}">
                  Click Here
                </a>
            </p>
          `
          ,email:req.body.email
        })//.then((data) => console.log("data is: ",data)).catch((error) => console.log("error is: ",error));
