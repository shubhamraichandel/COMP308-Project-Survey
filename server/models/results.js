
let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let singleResultSchema = new Schema({
    type:String,
    questionTopic: String,
    ans:{ a1:String,
        a1result:Number,
        a2:String,
        a2result:Number,
        a3:String,
        a3result:Number,
        total:0
    }
},
{
  collection: "singleResults"
});

let resultsSchema = new Schema({
    surveyID: String,  
    answers: [singleResultSchema]
},
{
  collection: "responses"
});

module.exports = function () {
  this.SingleResult = mongoose.model('SingleResult', singleResultSchema);
  this.Results = mongoose.model('Results', resultsSchema);
  return this;
}