let notify = require('./notify.js');

notify.init('127.0.0.1', '27017', 'newDB')
notify.ws.addLChannel('heba',function(data) {
  return "ahmed"
});
