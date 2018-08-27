let express = require('express');
let router = express.Router();
let validator = require('validator');
var rp = require('request-promise');
var cors = require("cors");
let conf = require("../conf/serverconf");
let fence = require("../wialon/fence");
let mail = require("../mail/mail");
let jwt = require("jsonwebtoken");
var host = conf.cycle == "dev" ? "localhost:9876" : "ec2-18-220-223-50.us-east-2.compute.amazonaws.com:9876"

router.get("/verify", function (req, resp) {
  
  try {
    if (req.decoded.type != "verify")
      throw "wrong token sent"
    else {
      resp.status(200).render("./verify", {});
    }
  }catch(err){
    console.log(err)
  }
  
})
router.post("/verify", function (req, resp) {
  let password = req.body.password || req.params.password || req.query.password || null;
  let nid = req.decoded.nid

  rp({
    uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][pass]=${password}&filter[where][passStatus]=verify`,
    json: true,
    method: "GET"
  })
    .then((data) => {
      if (data.length != 1) throw "User not allowed to verify"
      data = data[0];
      return rp({
        method: 'POST',
        url: `http://localhost:3000/api/parents/upsertWithWhere?where={"id":"${data.id}"}`,
        headers: {
          'content-type': 'application/json'
        },
        body: {
          "passStatus": "blocked",
        },
        json: true
      })
    })
    .then((data) => {
      console.log(data)
      if (!data.nid) throw "User is not verified"
      resp.json({
        success: true,
        message: "user email verified"
      });
    })
    .catch((error) => {
      resp.json({
        success: false,
        message: error
      });
    })
})
router.get("/reset", function (req, resp) {
  Promise.resolve(() => {
    console.log(req.decoded);
    if (req.decoded.type != "reset") throw "wrong token sent"
    else {
      return true
    }
  }
  )
    .then((isCorrectToken) => {
      if (!isCorrectToken) throw "Wrong token"
      return rp({
        uri: `http://localhost:3000/api/parents/upsertWithWhere?where={"nid":"${req.decoded.nid}"}`,
        json: true,
        method: "POST",
        body: {
          "passStatus": "reset"
        }
      })
    })
    .then((user_data) => {
      console.log(user_data)
      resp.status(200).render("reset", {});
    })
    .catch((error) => {
      resp.json({
        success: false,
        message: error
      });
    })
})
router.post("/reset", function (req, resp) {
  let nid = req.decoded.nid || null;
  let password = req.body.password || req.params.password || req.query.password || null;
  Promise.resolve(function () {
    if (nid && passwrd) return true
    else throw "Missing Params"
  })
    .then(() => {
      return rp({
        uri: `http://localhost:3000/api/parents/upsertWithWhere?where={"nid":"${nid}" , "passStatus":"reset"}`,
        json: true,
        method: "POST",
        body: {
          pass: password,
          passStatus: "blocked"
        }
      })
    })
    .then((data) => {
      if (!data) throw "failed to change password"
      resp.json({
        success: true,
        message: "Password Changed Successfully"
      })
    })
    .catch((error) => {
      resp.json({
        success: false,
        message: "failed",
        error: error
      })
    })
})
router.use("/", function (req, resp, next) {
  if (req.decoded.type == "login" || req.decoded.type == "register")
    next();
  else
    resp.json({
      success: false,
      message: 'Using Wrong Token'
    });
})
router.post("/data", function (req, resp) {
  rp({
    uri: `http://localhost:3000/api/parents?filter[where][nid]=${req.decoded.data[0].nid}`,
    json: true,
    method: "GET"
  })
    .then((user_data) => {
      user_data = user_data[0];
      console.log("user data", user_data);
      resp.status(200).json({
        success: true,
        message: 'Your data',
        data: {
          name: user_data.name,
          children: user_data.children,
          loc: user_data.loc,
          nid: user_data.nid,
          email: user_data.email,
          phone: user_data.phone
        }
      });
    })
    .catch((err) => {
      resp.status(200).json({
        success: false,
        message: 'Error Message',
        error: err
      });
    })
});
router.post("/notification/:childTag", function (req, resp) {
  resp.redirect(307, `/notification/${req.params.childTag}/${10}/${0}?token=${req.query.token}`);
})
router.post("/notification/:childTag/:page", function (req, resp) {
  resp.redirect(307, `/notification/${req.params.childTag}/${req.params.page}/${0}?token=${req.query.token}`);
})
router.post("/notification/:childTag/:page/:skip", function (req, resp) {

  let tagID = req.params.childTag;
  Promise.resolve(validator.isInt(tagID))
    .then((tagIsValed) => {
      if (tagIsValed) {
        console.log(tagID, req.decoded.data[0].children);
        if (req.decoded.data[0].children[tagID]) {
          req.decoded.data[0].children[tagID]["id"] = tagID;
          return req.decoded.data[0].children[tagID]
        } else {
          throw "cannot find the child record or you are not allowed for this child"
        }
      } else {
        //return
        throw "The value is not tag ID";
      }
    })
    .then((child) => {
      console.log("child data", req.decoded);
      return {
        "bus": child.bus_id,
        "loc": req.decoded.data[0].loc.fence_id,
        "tag": child.id
      }
    })
    .then((ids) => {
      if (!req.params.page || req.params.page < 1 || !validator.isInt(req.params.page)) {
        req.params.page = 10;
      }
      if (!req.params.skip || req.params.skip < 0 || !validator.isInt(req.params.skip)) {
        req.params.skip = 0;
      }
      let getGeo = rp({
        uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.loc}&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[order][0]=time DESC`,
        json: true,
        method: "GET"
      });
      let getTag = rp({
        uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.tag}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[order][0]=time DESC`,
        json: true,
        method: "GET"
      });
      let getBus = rp({
        uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.bus}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[order][0]=time DESC`,
        json: true,
        method: "GET"
      });
      return Promise.all([getGeo, getTag, getBus])
    })
    .then((final) => {
      final = [...final[0], ...final[1], ...final[2]];
      final.sort(function (a, b) {
        return (a.time > b.time) ? -1 : ((b.time > a.time) ? 1 : 0);
      });

      resp.status(200).json({
        success: true,
        message: final
      });
    })
    .catch((err) => {
      resp.status(200).json({
        success: false,
        message: `failed due to : ${err}`
      });
    })
});
//under developement
router.post("/edit", function (req, resp) {

  var user_nid = req.decoded.data[0].nid;

  var oldFence = null;
  var userData = null;
  var newFence = null;

  rp({
    uri: `http://localhost:3000/api/parents?filter[where][nid]=${req.decoded.data[0].nid}&&filter[where][passStatus]=blocked`,
    json: true,
    method: "GET"
  })
    .then((data) => {
      if (data.length !== 1) throw "no user AVALIABLE";
      userData = data[0];
      oldFence = userData.loc
      //update Loc
      if (req.body.loc) {
        return fence.updateFence({
          name: userData.name,
          locLat: req.body.loc.locLat || oldFence.locLat,
          locLong: req.body.loc.locLong || oldFence.locLong,
          r: req.body.loc.r || 500,
          locDesc: req.body.loc.locDesc || oldFence.locDesc,
          id: oldFence.fence_id
        })
      }
    })
    .then((data) => {

      if (req.body.email) {

        var mailToken = jwt.sign({
          nid: userData.nid,
          name: userData.name,
          phone: req.body.phone || userData.phone,
          email: req.body.email || userData.email,
          type: "verify"
        }, conf.secretWord, {
            expiresIn: 172800
          }
        );
        console.log(req.body.email)
        return mail.sendMessage({
          msg: `please verify your mail by going to http://${host}/verify?token=${mailToken}`
          , html:
            `
            <p>Go to link to verify your account :
                <a href="http://${host}/verify?token=${mailToken}">
                  Click Here
                </a>
            </p>
          `
          , email: req.body.email
        })
      }
    })
    .then((data) => {
      return rp({
        method: 'POST',
        url: `http://localhost:3000/api/parents/upsertWithWhere?where={"nid":"${user_nid}"}`,
        headers: {
          'content-type': 'application/json'
        },
        body: {
          "loc": {
            locLat: (req.body.loc) ? req.body.loc.locLat : oldFence.locLat,
            locLong: (req.body.loc) ? req.body.loc.locLong : oldFence.locLong,
            locDesc: (req.body.loc) ? req.body.loc.locDesc : oldFence.locDesc,
            fence_id: oldFence.fence_id
          },
          "email": req.body.email || userData.email,
          "passStatus": (req.body.email) ? "verify" : "blocked",
          "pass": req.body.pass || userData.pass,
          "phone": req.body.phone || userData.phone
        },
        json: true
      })
    })
    .then((data) => {
      delete data.pass
      delete data.created_notification
      delete data.passStatus
      delete data.secCode

      resp.json({
        success: true,
        message: "done",
        data: data
      })
    })
    .catch((error) => {
      resp.json({
        success: false,
        message: error
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
