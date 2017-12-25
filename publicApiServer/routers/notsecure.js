let express = require('express');
let router = express.Router();
let request = require("request");
var rp = require('request-promise');
var jwt = require("jsonwebtoken");
var conf = require("../conf/serverconf");

router.get("/checkcode", (req, resp) => {

    var nid = req.body.nid || req.params.nid || req.query.nid || null;
    var secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;

    let validDataEntered = new Promise((resolve, reject) => {
      if(nid && secureCode) resolve({nid : nid , secureCode : secureCode});
      else reject("no nid or secure code to check");
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
    var nid = req.body.nid || req.params.nid || req.query.nid || null;
    var secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;

    var locLat = req.body.locLong || req.params.locLong || req.query.locLong || null;
    var locLong = req.body.locLat || req.params.locLat || req.query.locLat || null;
    var locDesc = req.body.locDesc || req.params.locDesc || req.query.locDesc || null;

    var name = req.body.name || req.params.name || req.query.name || null;
    var password = req.body.password || req.params.password || req.query.password || null;
    var userid = null,getfenceID=null;

    let validDataEntered = new Promise((resolve, reject) => {
      if(nid && secureCode && locLat && locDesc && locLong && name && password)
        resolve({
          nid , secureCode , locLat , locLong , locDesc , name , password
        });
      else reject("Missing parameters");
    });

    validDataEntered.then( (userCred)=>{
      return rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${userCred.nid}&filter[where][secCode]=${userCred.secureCode}&filter[where][passStatus]=register`,
                json: true,
                method: "GET"
              })
    })
    .then((resdata)=>{
      if (!(resdata.length > 0)) throw "User is Not Allowed to Register with system";
      resdata = resdata[0];
      userid = resdata.id;
      return rp({
                method: 'GET',
                url: 'https://hst-api.wialon.com/wialon/ajax.html',
                qs: {
                    svc: 'token/login',
                    params:`{"token":"${conf.token}"}`
                  }
              })
    })
    .then((getTokenResp)=>{

      getTokenResp = JSON.parse(getTokenResp);
      if(!getTokenResp["eid"]) throw "unable to connect the backend try again later";
      sesssion_id = getTokenResp["eid"];
      return  rp({
                  method: 'GET',
                  url: 'https://hst-api.wialon.com/wialon/ajax.html',
                  qs: {
                      svc: 'resource/update_zone',
                      params: `{\n"itemId":${conf.source},\n"id":0,\n"w":500,\n"callMode":"create",\n"n": "${name} home",\n"d": "${locDesc}",\n"t": 3,\n"tc":16711884,\n"ts":12,\n"f": 48,\n"path":"",\n"p":[{"x": ${parseFloat(locLat)}, "y": ${parseFloat(locLong)}, "r": 500}],\n"c": 2566914048,\n"ts":20,\n"min":0,\n"max":18,\n"b":{\n    "min_x":${parseFloat(locLat)},\n    "min_y":${parseFloat(locLong)},\n    "max_x":${parseFloat(locLat)},\n    "max_y":${parseFloat(locLong)},\n    "cen_x":${parseFloat(locLat)},\n    "cen_y":${parseFloat(locLong)}\n    },\n"libId": 0,\n"i": 4294967295\n}`,
                      sid: `${sesssion_id}`
                  },
                  headers: { 'cache-control': 'no-cache'  }
              })
    })
    .then((getGeoRes)=>{
      getGeoRes = JSON.parse(getGeoRes);
      getfenceID = getGeoRes[0];
      return rp({
          method: 'POST',
          url: `http://localhost:3000/api/parents/upsertWithWhere?where={"id":"${userid}"}`,
          headers: {
              'content-type': 'application/json'
          },
          body: {
              "passStatus": "blocked",
              "name": name,
              "secCode": 144311 + Math.floor(Math.random() * 84813736161378),
              "pass": password,
              "loc": {
                  "long"    : locLong,
                  "lat"     : locLat,
                  "fence_id": getfenceID
              },
              "created_notification": false
          },
          json: true
      })
    })
    .then((finaluserdata)=>{
      if (!finaluserdata) throw "no user is regiestered try again later";
      let arr = [];
      arr[0] = finaluserdata;

      finaluserdata = {
          status:"logged",
          data: arr
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
      if(nid && password)
        resolve({
          nid , password
        });
      else reject("Missing parameters");
    });

    validDataEntered.then((userCred)=>{
      return rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${userCred.nid}&filter[where][pass]=${userCred.password}`,
                json: true,
                method: "GET"
              })
    })
    .then((resdata)=>{
      if (!(resdata.length > 0)) throw "User Authentication Failed";
      const payload = {
          "status": "logged",
          "data": resdata
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
          token  : token
      });
    })
    .catch(function (err) {
        resp.json({
            success: false,
            message: err
        })
    });

});
router.all("*", (req, resp) => {
    resp.json({
        success: false,
        message: 'NO RESOURCE AVALIABLE'
    });
});
module.exports = router;
