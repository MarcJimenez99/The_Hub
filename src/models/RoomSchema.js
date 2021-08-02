const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  roomID: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  upvote: {
    type: Number,
    default: 0,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  arr_upvote: [{
    type: String,
    required: true
  }],
  arr_createdMessages: [{
    type: Object,
    required: true
  }]
});
module.exports = Item = mongoose.model('room', RoomSchema);