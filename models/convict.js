const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const ConvictSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    role:{ type: String, required: true },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
      }
      , 
    contactDetails: {
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    identityProof: { type: String, required: true }//digilocker link//  
    ,age: { type: Number, required: true },
    employmentStatus: { type: String },
    familyBackground: {
        parentsInfo: {
            name: {
                type: String,
                required: true
            },
            phoneno: {
                type: Number,
                required: true
            },
            address:
            {
                type: String,
                required: true
            }
        },
        highlights: { type: String }
    },
    cases:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Case'
        }
    ],
    chargeSheet:{
        type:mongoose.Schema.ObjectId,
        ref:'Chargesheet'
    }

}, { timestamps: true });


ConvictSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Convict', ConvictSchema);
