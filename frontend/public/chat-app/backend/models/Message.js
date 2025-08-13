const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content:  { type: String },
  type:     { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl:  { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
