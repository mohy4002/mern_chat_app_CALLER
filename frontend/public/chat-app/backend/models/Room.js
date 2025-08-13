const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
