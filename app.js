var notify = require("./notify.js")
notify.init()
notify.rest.addLChannel('demo',function(data) {
  console.log(data)
  return "heba"
});
notify.rest.addPChannel('demo')