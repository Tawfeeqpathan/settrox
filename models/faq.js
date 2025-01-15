const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  position: { type: Number, default: null}, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('faqs', faqSchema);
