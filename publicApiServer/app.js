var express = require('express');
var app = express();
var jwt = require("jsonwebtoken");
var bodyParser = require('body-parser');
var cors = require("cors");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.set('superSecret', 'mysecretword');
//middlewear to authenticate

app.use("/notsecure", require("./routers/notsecure.js"));
//middlewear to restrict unauthorized login
app.use("/", (req, resp, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return resp.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else if (decoded) {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return resp.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})
app.use("/", require("./routers/secure.js"));
app.listen(9876, () => console.log('Example app listening on port 9876!'))