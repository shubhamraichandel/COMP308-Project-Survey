
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let answerSchema = mongoose.Schema ({ 
    surveyID: Schema.Types.ObjectId,
    surveyTopic : String,
    user: Schema.Types.ObjectId,
    questions:{ type: Array, default:[]}
});


//Ready to go
module.exports = mongoose.model('answer', answerSchema);