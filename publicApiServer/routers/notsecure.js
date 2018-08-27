let express = require('express');
let router = express.Router();
let request = require("request");
let rp = require('request-promise');
let fence = require('../wialon/fence');
let jwt = require("jsonwebtoken");
let conf = require("../conf/serverconf");
let validator = require('validator');
let nodemailer = require('nodemailer');
var host = conf.cycle == "dev" ? "localhost:9876" : "ec2-18-220-223-50.us-east-2.compute.amazonaws.com:9876"
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: `${conf.mailUser}`,
      pass: `${conf.mailPass}`
    }
});

router.get("/checkcode", (req, resp) => {

    var nid        = req.body.nid        || req.params.nid        || req.query.nid        || null;
    var secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;

    let validDataEntered = new Promise((resolve, reject) => {
      if(nid && secureCode){

        if(validator.isAlphanumeric(nid+secureCode))
          resolve({nid : nid , secureCode : secureCode});
        else {
          reject("The Input containes illegal Characheters");
        }
      }else reject("no nid or secure code to check");
    });

    validDataEntered.then((userData) =>{
      return rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][secCode]=${secureCode}&filter[where][passStatus]=register`,
                json: true,
                method: "GET"
              })
    })
    .then((response) =>{
      if(!(response .length > 0)) throw "user is not allowed to Register";
      resp.json({
          success: true,
          message: "User is allowed to Register"
      })
    })
    .catch((err)=>{
      resp.json({
          success: false,
          message: err
      })
    })
})
router.post("/register", (req, resp) => {
    let nid        = req.body.nid        || req.params.nid        || req.query.nid        || null;
    let secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;
    let locLat     = req.body.locLong    || req.params.locLong    || req.query.locLong    || null;
    let locLong    = req.body.locLat     || req.params.locLat     || req.query.locLat     || null;
    let locDesc    = req.body.locDesc    || req.params.locDesc    || req.query.locDesc    || null;
    let name       = req.body.name       || req.params.name       || req.query.name       || null;
    let password   = req.body.password   || req.params.password   || req.query.password   || null;
    let phone      = req.body.phone      || req.params.phone      || req.query.phone      || null;
    let email      = req.body.email      || req.params.email      || req.query.email      || null;

    //router Global Variables
    let userid = null,getfenceID=null;

    let validDataEntered = new Promise((resolve, reject) => {
      console.log(req.query);
      if(nid && secureCode && locLat && locDesc && locLong && name && password && phone && email)
      {

          locDesc = validator.escape(locDesc);
          name    = validator.escape(name);
          locDesc = validator.escape(locDesc);
          resolve({
            nid , secureCode , locLat , locLong , locDesc , name , password ,phone , email
          });
      }
      else reject("Missing parameters");
    });

    validDataEntered.then( (userCred)=>{
      return  rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${userCred.nid}&filter[where][secCode]=${userCred.secureCode}&filter[where][passStatus]=register`,
                json: true,
                method: "GET"
              })
    })
    .then( (resdata)=>{
      console.log("resdata",resdata)
      if (!(resdata.length > 0 && resdata.length < 2)) throw "User is Not Allowed to Register with system";
      resdata = resdata[0];
      userid = resdata.id;
      return fence.createFence({
        name,
        locLat,
        locLat,
        r:500,
        locDesc
      })
    })
    .then((getGeoRes)=>{
      console.log("getGeoRes---------------------->")
      try{
        getfenceID = JSON.parse(getGeoRes)[0];
        conosle.log("Fence ID-------------->",getfenceID);
      }catch(er){
        console.log(er)
      }
      return rp({
          method: 'POST',
          url: `http://localhost:3000/api/parents/upsertWithWhere?where={"id":"${userid}"}`,
          headers: {
              'content-type': 'application/json'
          },
          body: {
              "passStatus": "verify",
              "name": name,
              "secCode": 144311 + Math.floor(Math.random() * 84813736161378),
              "pass": password,
              "loc": {
                "loclong"    : locLong,
                "locLat"     : locLat,
                "locDesc"    : locDesc,
                "fence_id": getfenceID
              },
              "created_notification": false,
              "email" :email,
              "phone" :phone
          },
          json: true
      })
    })
    .then(( )=>{
      console.log("final user data",finaluserdata)
      if (!finaluserdata) throw "no user is regiestered try again later";
      let arr = [];
      arr[0] = finaluserdata;

      //create mail token
      var mailToken = jwt.sign({
        nid , name ,phone ,email,type:"verify"
        }, conf.secretWord, {
          expiresIn: 172800
        }
      );
      //send verify mail to user where to verify mail
      var message = {
        from: 'schooltrackingsystems@gmail.com',
        to: email,
        subject: 'Message title',
        text: 'Plaintext version of the message',
        html:
          `
          <p>Go to link to verify your account :
              <a href="http://${host}/verify?token=${mailToken}">
                Click Here
              </a>
          </p>
          `
      };

      transporter.sendMail(message, (error, info) => {
        if (error) throw "Verification mail sending failed";
        console.log(info);
      });

      finaluserdata = {
        status:"logged",
        data: arr,
        type: "register"
      }

      var token = jwt.sign(finaluserdata, conf.secretWord, {
        expiresIn: 1440
      });

      resp.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
      })
    })
    .catch ((err) => {
      resp.json({
          success: false,
          message: err,
      })
    })
});
router.post("/login", function (req, resp) {
    var nid      = req.body.nid      || req.params.nid      || req.query.nid      || null;
    var password = req.body.password || req.params.password || req.query.password || null;

    let validDataEntered = new Promise((resolve, reject) => {

      if(nid && password){
        if(validator.isAlphanumeric(nid)){
          resolve({
            nid , password
          });
        }else{
          reject("no nid or secure code to check");
        }
      }else reject("Missing parameters");
    });

    validDataEntered.then((userCred)=>{
      return rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${userCred.nid}&filter[where][pass]=${userCred.password}&filter[where][passStatus]=blocked`,
                json: true,
                method: "GET"
              })
    })
    .then((resdata)=>{
      if (!(resdata.length > 0 && resdata.length < 2 )) throw "User Authentication Failed";
      const payload = {
          "status": "logged",
          "data"  : resdata,
          "type"  :"login"

      };
      //sign token
      var token = jwt.sign(payload, conf.secretWord, {
        expiresIn: 1440
      });
      console.log(payload);
      //set data
      // return the information including token as JSON
      resp.json({
          success: true,
          message: 'Enjoy your token!',
          token  : token,
      });
    })
    .catch(function (err) {
        resp.json({
            success: false,
            message: err
        })
    });

});
router.post('/reset',function(req,resp){
  var nid = req.body.nid || req.query.nid || req.params.nid || null
  rp({
              uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][passStatus]=blocked`,
              json: true,
              method: "GET"
  })
  .then((data)=>{
    console.log(data)
    if (data.length != 1) throw "You Maybe have requested for password reset before pleae check your mail or contact admin"
    //create mail token
    var mailToken = jwt.sign({
      nid:data[0].nid , name: data[0].name ,phone: data[0].phone ,email: data[0].email,type:"reset"
      }, conf.secretWord, {
        expiresIn: 172800
      }
    );
    //send reset mail to user where to verify mail
    console.log(data[0].email)
    var message = {
      from: 'schooltrackingsystems@gmail.com',
      to: `${data[0].email}`,
      subject: 'Reset your Password for School Tracking System',
      text: `Follow the link to reset your password http://${host}/reset?token=${mailToken} the link will expire in two days`,
      html:
        `
        <p>Go to link to reset your account :
            <a href="http://${host}/reset?token=${mailToken}">
              Click Here
            </a><br/>
            <p>Link Expires in 48 hours</p>
        </p>
        `
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error)
        throw error;
      }
      console.log(info);
    });

    return rp({
      uri: `http://localhost:3000/api/parents/upsertWithWhere?where={"nid":"${nid}"}`,
      method: "POST",
      body:{
        "passStatus":"requested"
      },
      json: true
    })
  })
  .then((data)=>{
    if(!data || !data.passStatus == "requested" ) throw "failed to Reset"
    resp.json({
        success: true,
        message: 'Please check your email to reset your password'
    });
  })
  .catch((error)=>{
    resp.json({
        success: false,
        message: 'failed to register user',
        error:error
    });
  })
})

router.all("*", (req, resp) => {
    resp.json({
        success: false,
        message: 'NO RESOURCE AVALIABLE'
    });
});
module.exports = router;
