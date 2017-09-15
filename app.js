var notify = require("./notify.js")

notify.init('127.0.0.1', '27017', 'newDB', 'notification')
notify.rest.addLChannel('heba',function(data) {
  return "heba"
});
notify.rest.addPChannel('heba')
