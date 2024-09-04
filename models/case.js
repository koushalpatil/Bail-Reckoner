const mongoose = require('mongoose');
const CaseSchema = new mongoose.Schema({
    caseTitle: { type: String, required: true },
    caseType: { type: String, enum: ['Criminal', 'Civil', 'Family', 'Labor', 'Commercial'], required: true },
    appeals: [{
        appealDate: { type: Date },
        appealCourt: { type: String },
        outcome: { type: String }
      }],
    filingDate: { type: Date, required: true },
    verdict: { type: String },
      court: {
        courtName: { type: String, required: true },
        courtAddress: { type: String },
      },              
    status: { type: String, enum: ['Ongoing', 'Closed'], required: true },
    courtDates: [{ type: [Date], required: true }],
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'Judge', required: true },
    accussed: { type: mongoose.Schema.ObjectId, ref:'Convict',required: true },
    defendant: { type: String,required: true },
    lawyer1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true }],
    lawyer2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true }],
    judgementPassed:[{
        date:{
            type:Date,
            required:true
        },
        judge:
        {
            type:mongoose.Schema.ObjectId,
            required:true
        },
        judgement:
        {
            type:String,
            required:true
        }
    }],
    caseProceedings: {
      evidencePresented: [{ type: [String] }], 
      witnessesTestified: [{
        name:{
          type:String,
          required:true
        },

        contact:
        {
          type:Number,
          required:true
        },
        address:
        {
          type:String,
          required:true
        },
        testimony:[{
          type:String
        }]
      }],
      witnessHashes: [String] 
    },
    signed: { type: String, default: "off" }, 
    stenographer: { type: mongoose.Schema.ObjectId, required: true,ref:'Stenographer' },
    natureOfOffense: { type: String, required: true },
    chargesPressed: [{ type: [String], required: true }],
    dateOfArrest: { type: Date, required: true },
    investigationStatus: { type: String, enum: ['Ongoing', 'Completed'], required: true },
    sentenceServed: { type: String },
    convictionStatus: { type: String, enum: ['Arrested','UnderTrial', 'Convicted','Acquited'], required: true },
    // documents:[{
    //   type:mongoose.Schema.ObjectId,
    //   ref:'DocumentLog'
    // }]
  }, { timestamps: true });
  
  module.exports = mongoose.model('Case', CaseSchema);
  