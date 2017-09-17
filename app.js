let notify = require('./notify.js');

notify.init('127.0.0.1', '27017', 'newDB')

notify.wsAddLChannel('javascript', function (data) {
  return data;
})
notify.wsAddLChannel('Bootstrap', function (data) {
  return data;
})
notify.ws.addPChannel('javascript');
notify.ws.addPChannel('Bootstrap');
