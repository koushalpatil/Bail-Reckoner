const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const LawyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role:{ type: String, required: true },
    username: { type: String, required: true },
    educationStatus: { type: String, required: true },
    experience: { type: Number, required: true }, 
    specialty: { type: [String], required: true }, 
    age: { type: Number, required: true },
    contactDetails: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true }
    },
    cases: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Case'
    }], 
    availabilityStatus: { type: String, enum: ['Available', 'Unavailable'], required: true }
  }, { timestamps: true });
  

  LawyerSchema.plugin(passportLocalMongoose);
  module.exports = mongoose.model('Lawyer', LawyerSchema);
  