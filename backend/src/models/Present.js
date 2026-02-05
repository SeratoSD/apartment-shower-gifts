const mongoose = require('mongoose');

const presentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  photo: String,
  url: String,
  bought: { type: Boolean, default: false },
  buyerName: String,
  boughtAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Present', presentSchema);
