const mongoose = require('mongoose');
const BailApplicationSchema = new mongoose.Schema({
    convict: { type: mongoose.Schema.Types.ObjectId, ref: 'Convict', required: true }, // Reference to Convict
    eligibilityStatus: { type: String, enum: ['Eligible', 'Not Eligible'], required: true },
    applicationDate: { type: Date, default: Date.now },
    applicationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewTimeFrame: { type: Number }, // Time frame in days for review
    lawyerAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer' }, // Reference to Lawyer
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'Judge' }, // Reference to Judge
    resolved: { type: Boolean, default: false } // Whether the application is resolved
  }, { timestamps: true });
  
  module.exports = mongoose.model('BailApplication', BailApplicationSchema);
  