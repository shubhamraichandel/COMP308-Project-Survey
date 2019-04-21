/** Author   : Group 13
 *  App Name : XResearch
 *  
 */


let mongoose = require('mongoose');

//import surveys model
let survey = require('../models/surveys');
let answerSchema = require('../models/answer');
let questionSchema = require('../models/question');

var excel = require('node-excel-export');
var schema = require('../models/results')();


//convert to timezone
let moment = require('moment-timezone');


module.exports.DisplaySurveyList = (req, res) => {
    let currentDate = new Date();
    survey.find({ 
        expireDate: { $gt: currentDate },
        startDate : { $lt: currentDate }
        }, (err, surveys) => {
        if (err) {
            return console.error(err);
        }
        else {
            res.render('surveys/index', {
                title: 'Surveys List',
                surveys: surveys,
                displayName: req.user ? req.user.displayName : ''
            })
        }
    });
}

// Display create survey ejs page
module.exports.DisplayAddSurvey = (req, res) => {

    let query = require('url').parse(req.url, true).query;
    let topic = query.topic;
    let numberOfQuestion = query.numberOfQuestion;
    let type = query.type;

  

    res.render('surveys/create', {
        title: "Create Survey",
        surveys: '',
        displayName: req.user.displayName,
        userid: req.user._id,
        numberOfQuestion: parseInt(numberOfQuestion),
        topic: topic,
        type: type
    });
}

// Create a new survey and insert it into the db
module.exports.ProcessAddSurvey = (req, res) => {
    try {       
        
        let numberOfQuestion = req.body.numberOfQuestion;

        let questionArray = [];
        let type = req.body.type;
        for (var i = 1; i <= numberOfQuestion; ++i) {
           if(type == 1 || type == 2){
               if(req.body['questionAns' + i + '3'] != ""){
                  let question = {
                    "questionTopic": req.body['questionTopic' + i],
                    "questionAns":
                    [
                        { "answer": req.body['questionAns' + i + '1'] },
                        { "answer": req.body['questionAns' + i + '2'] },
                        { "answer": req.body['questionAns' + i + '3'] }
                    ],
                    "type": req.body.type
                }
                 questionArray.push(question);
               }
               else{
                   let question = {
                    "questionTopic": req.body['questionTopic' + i],
                    "questionAns":
                    [
                        { "answer": req.body['questionAns' + i + '1'] },
                        { "answer": req.body['questionAns' + i + '2'] }       
                    ],
                    "type": req.body.type
                }
                 questionArray.push(question);
               }
                
           }
           else if(type ==3){
                  let question = {
                    "questionTopic": req.body['questionTopic' + i],
                    "type": req.body.type
                }
                 questionArray.push(question);
           }    
        }

        console.log(questionArray);
        console.log(questionArray[0].questionAns);

        let currentDate = new Date();
        let newSurvey = survey({
            "topic": req.body.topic,
            "user": req.user._id,
            "type":type,
            "createDate": currentDate,
            "startDate" : req.body.startDate,
            "expireDate": req.body.expireDate,
            "questions": questionArray,
            
        });


        survey.create(newSurvey, (err, survey) => {
            if (err) {
                console.log(err);
                res.end(err);
            } else {
                res.redirect('/surveys/userSurveys');
            }
        });
    }
    catch (err) {
        console.log(err);
        res.redirect('/errors/404');
    }
}

module.exports.DisplayResponsePage = (req, res) => {

    try {
        let id = req.params.id;

        // find one survey by its id
        survey.findById(id, (err, surveys) => {
            if (err) {
                console.log(err);
                res.end(error);
            } else {
                // show the survey page
                res.render('surveys/response', {
                    title: surveys.topic,
                    user: surveys.user,
                    type: surveys.questions[0].type,
                    surveys: surveys,
                    displayName: req.user ? req.user.displayName : '',
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/errors/404');
    }
}

// Process the response survey request
module.exports.ProcessResponsePage = (req, res) => {
    let numberofQuestions = req.body.numberofQuestions;
    console.log(numberofQuestions);
    let questionArray = [];
    for (var i = 0; i < numberofQuestions; ++i) {

        let question = {
            "questionTopic": req.body['questionTopic' + i],
            "questionAns": req.body['question' + i]
        }

        questionArray.push(question);
    }

    let id = req.params.id;
    let newResponse = answerSchema({
        "surveyID":id,
        "surveyTopic": req.body.surveyTopic,
        "user": req.body.userId,
        "questions": questionArray,
    });


    answerSchema.create(newResponse, (err, answer) => {
        try {
            if (err) {
                console.log(err);
                res.end(err);
            } else {
                res.redirect('/surveys');
            }
        } catch (err) {
            console.log(err);
            res.redirect('/errors/404');
        }
    });
}

// Display surveys list by user id
module.exports.DisplayUserSurvey = (req, res) => {
    let userId = req.user._id;
     //only show the surveys created by the user
    survey.find({ user: userId }, (err, surveys) => {
        if (err) {
            return console.error(err);
        }
        else {
            res.render('surveys/userSurvey', {
                title: 'My Surveys List',
                surveys: surveys,
                messages:'',
                displayName: req.user.displayName,
            })
        }
    });
}

//display the survey detail page
module.exports.DisplaySurveyDetails =  (req, res) => {
    try {
       let id = req.params.id;
        // find one survey by its id
        survey.findById(id, (err, surveys) => {
            if (err) {
                console.log(err);
                res.end(error);
            } else {
                // show the survey page
                res.render('surveys/surveyDetail', {
                    title: surveys.topic,
                    user: surveys.user,
                    type: surveys.questions[0].type,
                    surveys: surveys,
                    displayName: req.user.displayName
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/errors/404');
    }
}

// Delete the survey by the survey id
module.exports.DeleteSurvey = (req, res) => {
        // get a reference to the id from the url
        let id = req.params.id;

    survey.remove({_id: id}, (err) => {
      if(err) {
        console.log(err);
        res.end(err);
      } else {
        // refresh the my survey list
        res.redirect('/surveys/mySurveys');
      }
    });
}


//Display the inital page for creating a survey
module.exports.DisplayInitialPage = (req, res) => {
    res.render('surveys/init', {
        title: "Create Survey",
        surveys: '',
        displayName: req.user.displayName,
        userid: req.user._id
    });
}

//Go to next step to input questions and answers
module.exports.DisplayAddPage = (req, res) => {
    //
    console.log(req.body.numberOfQuestion);
    console.log(req.body.topic);

    console.log(req.body.type);
    let numberOfQuestion = parseInt(req.body.numberOfQuestion)
    //redirect params to create page
    res.redirect('/surveys/create/' + '?topic=' + req.body.topic + '&type=' + req.body.type + '&numberOfQuestion=' + numberOfQuestion);
}





// https://www.npmjs.com/package/node-excel-export we used for exporting xlsx file
module.exports.exportToExcel = (req, res) => {

    let id = req.params.id;
var styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: 'FF000000'
      }
    },
    font: {
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 14,
      bold: true,
      underline: true
    }
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: 'FFFFCCFF'
      }
    }
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: 'FF00FF00'
      }
    }
  }
};
 
 schema.Results.find({"surveyID":id},(err,results)=>{

     if(err) {
        console.log(err);
        res.end(err);
      } else {

          let dataset = [
 
]
          console.log(results);
          console.log("excel complexity.");
          let result = results[0];
          console.log(result);
          let answers = result.answers;
          for(let count=0;count<answers.length;count++)
          {
              console.log(answers[count].questionTopic);
              dataset.push({topic_name:answers[count].questionTopic,first_ans:answers[count].ans["a1"],first_ans_res:answers[count].ans["a1result"],
              
             second_ans:answers[count].ans["a2"],second_ans_res:answers[count].ans["a2result"],

              third_ans:answers[count].ans["a3"],third_ans_res:answers[count].ans["a3result"],total:answers[count].ans["total"]}
              
              );
          }


          var specification = {
    topic_name: { 
    displayName: 'Topic', 
    headerStyle: styles.headerDark, 
    cellStyle: function(value, row) {  
      return (row.status_id == 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible  
    },
    width: 120 
  },
  first_ans: {
    displayName: 'first_ans',
    headerStyle: styles.headerDark,   
    width: '10'  
  },
  first_ans_res: {
    displayName: 'first_ans_res',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, 
    width: '10' 
  },
   second_ans: {
    displayName: 'second_ans',
    headerStyle: styles.headerDark,
    
    width: '10' 
  },
  second_ans_res: {
    displayName: 'second_ans_res',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style 
    width: '10' // <- width in pixels 
  },
   third_ans: {
    displayName: 'third_ans',
    headerStyle: styles.headerDark,
    // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property 
    //   return (value == 1) ? 'Active' : 'Inactive';
    // },
    width: '10' // <- width in chars (when the number is passed as string) 
  },
  third_ans_res: {
    displayName: 'third_ans_res',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style 
    width: '10' // <- width in pixels 
  },

  total: {
    displayName: 'total',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style 
    width: '10' // <- width in pixels 
  },
}
 
// The data set should have the following shape (Array of Objects) 
// The order of the keys is irrelevant, it is also irrelevant if the 
// dataset contains more fields as the report is build based on the 
// specification provided above. But you should have all the fields 
// that are listed in the report specification 

 
// Create the excel report. 
// This function will return Buffer 
var report = excel.buildExport(
  [ 
    {
      name: 'Sheet name', 
      specification: specification, 
      data: dataset 
    }
  ]
);
 
// You can then return this straight 
res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
console.log("excel called.")
return res.send(report);    
     }}
);
}





