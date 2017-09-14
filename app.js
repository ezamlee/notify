var notifyFN = require("./notify.js")
var notify =  new notifyFN();
notify.init()
notify.ws.addLChannel();
