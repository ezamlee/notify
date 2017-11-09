let express = require('express');
let router = express.Router();

router.get("/", function (req, resp) {
    resp.status(200).send("Success from secure")
})

router.all("*", (req, resp) => {
    resp.json({
        success: false,
        message: 'NO RESOURCE AVALIABLE'
    });
})
module.exports = router;