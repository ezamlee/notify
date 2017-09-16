let notify = require('./notify.js');

notify.init('127.0.0.1', '27017', 'newDB')
notify.rest.addLChannel('heba',function(data) {
  return "heba"
});
notify.ws.addLChannel('heba',function(data) {
  return "ahmed"
});
notify.rest.addPChannel('heba');
