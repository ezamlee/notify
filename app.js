var notifyFN = require("./notify.js")
var notify =  new notifyFN();
notify.init()
// notify.rest.addLChannel('demo',function() {
//   console.log("heba");
// });

console.log("notify.prototype.rest",notify.rest);
