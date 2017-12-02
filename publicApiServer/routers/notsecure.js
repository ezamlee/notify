let express = require('express');
let router = express.Router();
let request = require("request");
var rp = require('request-promise');
var jwt = require("jsonwebtoken");

router.get("/checkcode", (req, resp) => {
    var nid = req.body.nid || req.params.nid || req.query.nid || null;
    var secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;
    if (nid && secureCode) {
        rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][secCode]=${secureCode}&filter[where][passStatus]=register`,
                json: true,
                method: "GET"
            })
            .then(function (resdata) {
                if (resdata.length > 0) {
                    resp.json({
                        success: true,
                        message: "User is allowed to Register"
                    })
                } else {
                    resp.json({
                        success: false,
                        message: "user is not allowed to Register"
                    })
                }
            })
            .catch(function (err) {
                resp.json({
                    success: false,
                    message: "Data is misleading or user is not allowed"
                })
            });
    } else {
        resp.json({
            success: false,
            message: 'no national id and secure code'
        });
    }
})
router.post("/register", (req, resp) => {
    var nid = req.body.nid || req.params.nid || req.query.nid || null;
    var secureCode = req.body.secureCode || req.params.secureCode || req.query.secureCode || null;

    var locLat = req.body.locLat || req.params.locLat || req.query.locLat || null;
    var locLong = req.body.locLong || req.params.locLong || req.query.locLong || null;
    var locDesc = req.body.locDesc || req.params.locDesc || req.query.locDesc || null;

    var name = req.body.name || req.params.name || req.query.name || null;
    var password = req.body.password || req.params.password || req.query.password || null;

    if (nid && secureCode && locLat && locLong && locDesc && name && password) {
        rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][secCode]=${secureCode}&filter[where][passStatus]=register`,
                json: true,
                method: "GET"
            })
            .then(function (resdata) {
                if (resdata.length > 0) {
                    resdata = resdata[0];
                    userid = resdata.id;
                    //create geofence
                    rp({
                        method: 'GET',
                        url: 'https://hst-api.wialon.com/wialon/ajax.html',
                        qs: {
                            svc: 'token/login',
                            params: '{"token":"0e31585320d29e3db8ca8cbeab99ed5f0D7BE7ABF62C6B2B116939425C9D0537945796ED"}'
                        }
                    }).then((getTokenResp) => {
                        getTokenResp = JSON.parse(getTokenResp);
                        console.log(getTokenResp);
                        if (getTokenResp["eid"]) {
                            sesssion_id = getTokenResp["eid"]
                            rp({
                                method: 'GET',
                                url: 'https://hst-api.wialon.com/wialon/ajax.html',
                                qs: {
                                    svc: 'resource/update_zone',
                                    params: `{\n"itemId":15766062,\n"id":0,\n"w":500,\n"callMode":"create",\n"n": "${name} home",\n"d": "${locDesc}",\n"t": 3,\n"tc":16711884,\n"ts":12,\n"f": 48,\n"path":"",\n"p":[{"x": ${parseFloat(locLat)}, "y": ${parseFloat(locLong)}, "r": 500}],\n"c": 2566914048,\n"ts":20,\n"min":0,\n"max":18,\n"b":{\n    "min_x":${parseFloat(locLat)},\n    "min_y":${parseFloat(locLong)},\n    "max_x":${parseFloat(locLat)},\n    "max_y":${parseFloat(locLong)},\n    "cen_x":${parseFloat(locLat)},\n    "cen_y":${parseFloat(locLong)}\n    },\n"libId": 0,\n"i": 4294967295\n}`,
                                    sid: `${sesssion_id}`
                                },
                                headers: {
                                    'cache-control': 'no-cache'
                                }
                            }).then((getGeoRes) => {
                                getGeoRes = JSON.parse(getGeoRes);
                                getfenceID = getGeoRes[0];
                                //userid
                                rp({
                                    method: 'POST',
                                    url: `http://localhost:3000/api/parents/update?where={"id":"${userid}"}`,
                                    headers: {
                                        'content-type': 'application/json'
                                    },
                                    body: {
                                        "passStatus": "blocked",
                                        "name": name,
                                        "secCode": 144311 + Math.floor(Math.random() * 84813736161378),
                                        "pass": password,
                                        "loc": {
                                            "long": locLong,
                                            "lat": locLat,
                                            "fence_id": getfenceID
                                        },
                                        "created_notification": false
                                    },
                                    json: true
                                }).then((finaluserdata) => {
                                    if (finaluserdata && parseInt(finaluserdata.count) && parseInt(finaluserdata.count) > 0) {
                                        resp.json({
                                            success: true,
                                            message: "user successfully registered"
                                        })
                                    } else {
                                        resp.json({
                                            success: false,
                                            message: "unable to register  user/server error"
                                        })
                                    }
                                }).catch((err) => {
                                    resp.json({
                                        success: false,
                                        message: "unable to register user server error",
                                        error: err
                                    })
                                })
                            }).catch((err) => {
                                resp.json({
                                    success: false,
                                    message: "unable to register user  3 server error",
                                    error: err
                                })
                            })
                        } else {
                            resp.json({
                                success: false,
                                message: "unable to register user  4 server error"
                            })
                        }
                    }).catch((err) => {
                        resp.json({
                            success: false,
                            message: "unable to register user  5 server error",
                            error: err
                        })
                    })
                } else {
                    resp.json({
                        success: false,
                        message: "user is not allowed to Register"
                    })
                }

            })
            .catch(function (err) {
                resp.json({
                    success: false,
                    message: "Data is misleading or user is not allowed" + err
                })
            });
    } else {
        resp.json({
            success: false,
            message: 'Cannot Register User'
        });
    }
});
router.post("/login", function (req, resp) {
    var nid = req.body.nid || req.params.nid || req.query.nid || null;
    var password = req.body.password || req.params.password || req.query.password || null;
    if (nid && password) {
        rp({
                uri: `http://localhost:3000/api/parents?filter[where][nid]=${nid}&filter[where][pass]=${password}`,
                json: true,
                method: "GET"
            })
            .then(function (resdata) {
                if (resdata.length > 0) {
                    const payload = {
                        "nid": nid,
                        "status": "logged",
                        "data": resdata
                    };
                    //sign token
                    var token = jwt.sign(payload, "mysecretword", {

                    });
                    //set data
                    // return the information including token as JSON
                    resp.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token,
                        data: {
                            "children": resdata.children,
                            "loc": resdata.loc
                        }
                    });
                } else {
                    resp.json({
                        success: false,
                        message: "failed to login"
                    })
                }
            })
            .catch(function (err) {
                resp.json({
                    success: false,
                    message: "Data is misleading or user is not allowed"
                })
            });
    } else {
        resp.json({
            success: false,
            message: 'failed to get user and his password',
            eer: req.query.nid + req.query.password
        });
    }
});
router.all("*", (req, resp) => {
    resp.json({
        success: false,
        message: 'NO RESOURCE AVALIABLE'
    });
});
module.exports = router;