var notify = require("./notify.js")
notify.init(mongoHost,MongoPort,Database,Collection)
notify.rest.addLChannel('demo',function(data) {
  console.log(data)
  return "heba"
});
notify.rest.addPChannel('demo')