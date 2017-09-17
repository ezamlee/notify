let notify = require('./notify.js');

notify.init('127.0.0.1', '27017', 'newDB')
console.log(notify.ws.addPChannel)
notify.ws.addLChannel('javascript', function (data) {
  return data;
})
notify.ws.addPChannel('javascript', function (data) {
  return data;
})
// notify.ws.addPChannel('javascript');
// notify.ws.addPChannel('Bootstrap');
