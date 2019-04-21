/** Author   : Group 13
 *  App Name : XResearch
 *  
 */

let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let answer = new Schema ({ answer : String });

    let questionSchema = mongoose.Schema({
        questionTopic : String,
        questionAns : [{ answer : String }],
        type : Number
    });

//Ready to go
module.exports = mongoose.model('question', questionSchema);