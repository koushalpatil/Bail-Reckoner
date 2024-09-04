const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const StenographerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  contactDetails: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
   
  },
  role:{ type: String, required: true },
  digitalSignature: {
    digitalSignatureURL: { type: String },  // URL or path to the digital signature file
    digitalSignatureHash: { type: String }  // Hash of the digital signature for blockchain verification
  },
  documents:[{
    type:mongoose.Schema.ObjectId,
    ref:'DocumentLog'
  }],
  assignedCases: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case'
    }
  ]
}, { timestamps: true });


StenographerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Stenographer', StenographerSchema);
