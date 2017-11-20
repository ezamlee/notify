let express = require('express');
let router = express.Router();
let validator = require('validator');
var rp = require('request-promise');

router.post("/children", function (req, resp) {
    var user_data = req.decoded;
    resp.status(200).json({
        success: true,
        message: 'Children Details',
        data: user_data.data[0].children ? user_data.data[0].children : null
    });
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
                if (req.decoded.data[0].children[tagID]) {
                    req.decoded.data[0].children[tagID]["id"] = tagID
                    return req.decoded.data[0].children[tagID]
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
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.loc}&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}`,
                json: true,
                method: "GET"
            });
            let getTag = rp({
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.tag}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}`,
                json: true,
                method: "GET"
            });
            let getBus = rp({
                uri: `http://localhost:3000/api/notifications?filter[where][sid]=${ids.bus}&&filter[limit]=${req.params.page}&filter[skip]=${req.params.skip}`,
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