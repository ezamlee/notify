var notify= require("./notify.js")
notify.init()
notify.rest.addLChannel('demo',function() {
  return "heba"
});
notify.rest.addPChannel('demo')