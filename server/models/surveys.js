
let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let question = require('../models/question');

//create survey model class
let surveySchema = mongoose.Schema({
    topic: String,
    user: Schema.Types.ObjectId,
    type:Number,
    createDate : { type : Date, default : Date.now },
    startDate : Date,
    expireDate : Date,
    questions : { type: Array, default:[]}
    
},
{
  collection: "allSurveys"
}
);

//Ready to go
module.exports = mongoose.model('surveys', surveySchema);