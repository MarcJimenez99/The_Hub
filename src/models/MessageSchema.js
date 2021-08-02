const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  roomID: {
      type: String,
      required: true
  },
  username: {
    type: String,
    required: true
  },
  dateOfEntry: {
    type: String,
    default: Date.now()
  },
  message: {
    type: String,
    required: true
  },
  messageID: {
    type: String,
    required: true,  
    unique: true
  },
  editFlag: {
    type: Boolean,
    required: true
  }
});
module.exports = Item = mongoose.model('message', MessageSchema);