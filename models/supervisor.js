const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const SupervisorReviewSchema = new mongoose.Schema({
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'Judge', required: true }, // Reference to the lower judge being reviewed
    role:{ type: String, required: true },
    casesReviewed: { type: [mongoose.Schema.Types.ObjectId], ref: 'Case' }, // References to cases reviewed
    decisionsOverturned: { type: Number, default: 0 }, // Number of decisions overturned
    reviewDate: { type: Date, default: Date.now },
    remarks: { type: String } // Additional comments by the supervisor
  }, { timestamps: true });
  

  SupervisorReviewSchema.plugin(passportLocalMongoose);
  module.exports = mongoose.model('SupervisorReview', SupervisorReviewSchema);
  