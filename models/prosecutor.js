const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const ProsecutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role:{ type: String, required: true },
    username: { type: String, required: true },
    contactDetails: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    policeStation: {
        type: String,
        required: true
    },
    profilePictureURL: {
        type: String
    },
    policeId:
    {
        type:String,
        required:true
    }
}, { timestamps: true });


ProsecutorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Prosecutor', ProsecutorSchema);
