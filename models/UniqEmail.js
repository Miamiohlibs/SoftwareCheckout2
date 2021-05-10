const mongoose = require('mongoose');

const UniqEmailSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  uniqEmail: {
    type: String,
    required: true,
  },
  lastUpdate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('emails', UniqEmailSchema);
