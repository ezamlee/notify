var mongoose=require("mongoose");

var topicsSchema = new mongoose.Schema({
  _id:String,
  'topic': String,
});
var topics = mongoose.model('topics', topicsSchema);

module.exports = topics;
