const mongoose = require('mongoose');
const DocumentLogSchema = new mongoose.Schema({
    documentName: { type: String, required: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true }, // Reference to Case
    createdBy: { type: mongoose.Schema.ObjectId, required: true,ref:'Stenographer' }, // Name or ID of the person who created the document
    createdDate: { type: Date, default: Date.now },
    lastModifiedBy: { type: String }, // Name or ID of the last person who modified the document
    lastModifiedDate: { type: Date },
    signed: { type: Boolean, default: false } // Whether the document is signed,
    ,
    digitalSignature: {
      digitalSignatureURL: { type: String },  // URL or path to the digital signature file
      digitalSignatureHash: { type: String }  // Hash of the digital signature for blockchain verification
    },
    case:
    {
      type:mongoose.Schema.ObjectId,
      ref:'Convict'
    }
  }, { timestamps: true });
  
  module.exports = mongoose.model('DocumentLog', DocumentLogSchema);
  