const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned'],
    default: 'Open',
  },
}, { timestamps: true });


gigSchema.index({ title: 'text' });

module.exports = mongoose.model('Gig', gigSchema);