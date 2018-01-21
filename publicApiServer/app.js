var express = require('express');
var app = express();
var jwt = require("jsonwebtoken");
var bodyParser = require('body-parser');
var cors = require("cors");
var conf = require("./conf/serverconf");
var corsOptions = {
  origin: 'http://localhost:9876',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/notsecure", require("./routers/notsecure.js"));
app.use("/", (req, resp, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, conf.secretWord, function(err, decoded) {
      if (err) {
        return resp.json({
          success: false,
          message: 'Failed to authenticate token.',
          err: conf.cycle == "dev" ? err : ""
        });
      } else if (decoded) {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    return resp.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
})
app.use("/", require("./routers/secure.js"));
app.listen(9876, () => console.log('Example app listening on port 9876!'))
