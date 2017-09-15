var notifyFN = require("./notify.js")
var notify =  new notifyFN();
notify.init()
console.log("notify.prototype.rest",notify.rest);

notify.rest.addLChannel('demo',function() {
  return "heba"
});
notify.rest.addPChannel('demo')