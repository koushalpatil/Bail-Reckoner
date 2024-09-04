const mongoose = require('mongoose');

const ChargesheetSchema = new mongoose.Schema({
    convict: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Convict', // Reference to the Convict model
        required: true
    },
    charges: 
        {
            type: String,
            required: true
        }
    ,
    evidence: [
        {
            description: { type: String },
            documentURL: { type: String } // Link to evidence documents
        }
    ],
    witnesses: 
        {
            name: { type: String },
            contactDetails: {
                phone: { type: String },
                email: { type: String }
            },
            testimony: { type: String } // Description of witness testimony
        }
    ,
    prosecutor: {
        name: { type: String },
        contactDetails: {
            phone: { type: String },
            email: { type: String }
        }
    },
    dateFiled: { type: Date, default: Date.now },
    policeStation:{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Completed', 'Dismissed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Chargesheet', ChargesheetSchema);
