var mongoose=require("mongoose");

var notificationsSchema = new mongoose.Schema({
  _id:String,
  'topic': String,
  'ts': Number,
  'notification':String,
  'HttpVersion': String,
  "params": {},
  "query": {},
  "body": {},
  'method': String,
  'headers':{}
});
var notifications = mongoose.model('notifications', notificationsSchema);

module.exports = notifications;
