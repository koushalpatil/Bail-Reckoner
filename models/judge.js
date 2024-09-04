const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const JudgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role:{ type: String, required: true },
    username: { type: String, required: true },
    contactDetails: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      
    },
    position: { type: String, required: true }, 
    cases:[
        {
        type:mongoose.Schema.ObjectId,
        ref:'Case'
        }
    ],
    digitalSignature: {
      digitalSignatureURL: { type: String },  // URL or path to the digital signature file
      digitalSignatureHash: { type: String }  // Hash of the digital signature for blockchain verification
    }
  }, { timestamps: true });
  

  JudgeSchema.plugin(passportLocalMongoose);
  module.exports = mongoose.model('Judge', JudgeSchema);
  