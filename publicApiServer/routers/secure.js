let express = require('express');
let router = express.Router();
let validator = require('validator');
var rp = require('request-promise');

router.post("/children", function (req, resp) {
    rp({
            uri: `http://localhost:3000/api/parents?filter[where][nid]=${req.decoded.data[0].nid}`,
            json: true,
            method: "GET"
        })
        .then((user_data) => {
            resp.status(200).json({
                success: true,
                message: 'Children Details',
                data: user_data && user_data.constructor === Array && user_data.length > 0 && user_data[0].children ? user_data[0].children : null
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

  /*
            { name: 'Maha',
6|app      |   pass: 'Mh111',
6|app      |   children:
6|app      |    { '1000': { bus: '4', bus_id: '16226557', name: 'Ahmed' },
6|app      |      '2000': { bus: 'bus 4', bus_id: '16226557', name: 'Heba' } },
6|app      |   loc: { long: '25.010737', lat: '30.5261475', fence_id: 3 },
6|app      |   nid: '20450869451234',
6|app      |   secCode: '9921560244177',
6|app      |   passStatus: 'blocked',
6|app      |   created_notification: false,
6|app      |   id: '5a394145c4128359e5ef46ba',
6|app      |   iat: 1513703274

            }
  */

    let tagID = req.params.childTag;
    Promise.resolve(validator.isInt(tagID))
        .then((tagIsValed) => {
            console.log("the code is",req.decoded)
            if (tagIsValed) {
                if (req.decoded.children[tagID]) {
                    req.decoded.children[tagID]["id"] = tagID
                    return req.decoded.children[tagID]
                } else {
                    throw "cannot find the child record"
                }
            } else {
                //return
                throw "The value is not tag ID";
            }
        })
        .then((child) => {
            return {
                "bus": child.bus_id,
                "loc": req.decoded.loc.fence_id,
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
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.loc}&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[DESC]=time`,
                json: true,
                method: "GET"
            });
            let getTag = rp({
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.tag}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[DESC]=time`,
                json: true,
                method: "GET"
            });
            let getBus = rp({
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.bus}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}&filter[DESC]=time`,
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

router.all("*", (req, resp) => {
    resp.json({
        success: false,
        message: 'NO RESOURCE AVALIABLE'
    });
});
module.exports = router;
