
let mongoose = require('mongoose');

//import surveys model
let survey = require('../models/surveys');
let answerSchema = require('../models/answer');
let questionSchema = require('../models/question');

var excel = require('node-excel-export');
var schema = require('../models/results')();


//convert to timezone
let moment = require('moment-timezone');




// read and display the survey list
module.exports.ReadSurveyList = (req, res) => {
    //get today's date
    let currentDate = new Date();
    //only show the expireDate is after currentDate
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
module.exports.DisplayAdd = (req, res) => {

    let query = require('url').parse(req.url, true).query;
    let topic = query.topic;
    let numberOfQuestion = query.numberOfQuestion;
    let type = query.type;

    /*
    let topic = req.params.topic;
    let numberOfQuestion = req.params.numberOfQuestion;
    let type = req.params.type;*/

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
module.exports.CreateSurvey = (req, res) => {
    try {


        
        
        //create question objects
        let numberOfQuestion = req.body.numberOfQuestion;

        //let Question = questionSchema;
        //let Answer = answerSchema;
        let questionArray = [];
        let type = req.body.type;
        //create questions accorder to the numberOfQuestion
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
        //console.log(req.body.userid);
        console.log(questionArray[0].questionAns);


        // get a reference to the id from the url
        //let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
        let newSurvey = survey({
            "topic": req.body.topic,
            "user": req.user._id,
            "type":type,
            "createDate": currentDate,
            "startDate" : req.body.startDate,
            "expireDate":  req.body.expireDate,//req.body.date,
            "questions": questionArray,
            /* schema model template
            [
                { "questionTopic" : req.body.questionTopic1,
                  "questionAns" : 
                  [
                      { "answer" : req.body.questionAns11 },
                      { "answer" : req.body.questionAns12 },
                      { "answer" : req.body.questionAns13 }                               
                  ],
                  "type" : 1
                },
                {
                  "questionTopic" : req.body.questionTopic2,
                  "questionAns" : 
                  [
                      { "answer" : req.body.questionAns21 },
                      { "answer" : req.body.questionAns22 },
                      { "answer" : req.body.questionAns23 }                               
                  ],
                  "type" : 1
                }
            ]*/

        });


        survey.create(newSurvey, (err, survey) => {
            if (err) {
                console.log(err);
                res.end(err);
            } else {
                res.redirect('/surveys/mySurveys');
            }
        });
    }
    catch (err) {
        console.log(err);
        res.redirect('/errors/404');
    }
}

// display the survey page
// find survey by survey id
module.exports.DisplayResponse = (req, res) => {

    try {
        // get a reference to the id from the url
        let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);

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
module.exports.ResponseSurvey = (req, res) => {
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

    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
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
module.exports.ReadUserSurvey = (req, res) => {
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
module.exports.ViewMySurvey =  (req, res) => {
    try {
       let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);
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
        let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);

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
        games: '',
        displayName: req.user.displayName,
        userid: req.user._id
    });
}

//Go to next step to input questions and answers
module.exports.GotoCreatePage = (req, res) => {
    //
    console.log(req.body.numberOfQuestion);
    console.log(req.body.topic);

    console.log(req.body.type);
    let numberOfQuestion = parseInt(req.body.numberOfQuestion)
    //redirect params to create page
    res.redirect('/surveys/create/' + '?topic=' + req.body.topic + '&type=' + req.body.type + '&numberOfQuestion=' + numberOfQuestion);
}


//below are new functionalities :statistics and excel report

//view the  survey statistics by survey id
module.exports.ViewSurveyStatistics = (req, res) => {
        // get a reference to the id from the url
    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    survey.find({_id: id}, (err,surveys) => {
      if(err) {
        console.log(err);
        res.end(err);
      } else {
          console.log("called."),
          answerSchema.find({"surveyID":id},(err,answers)=>{
            if(err) {
                 console.log(err);
                 res.end(err);
             } else {
                 try{
                        let respondents = answers.length;
                        if(respondents==0)
                        {
                            throw "no respondents yet.";
                        }                        
                            console.log("respondents");
                            console.log(respondents);

                            let numberOfQuestion = answers[0].questions.length;
                            console.log("numberOfQuestion");
                            console.log(numberOfQuestion);
                            let result_ = {}
                            for(let count = 0;count<numberOfQuestion;count++)
                            {
                                let part = {}  ;
                                let type = surveys[0].type;
                                part['type'] = type;
                                part['total'] = 0;
                                switch(type){
                                    case 1:
                                    {
                                    let ans0 = surveys[0].questions[count].questionAns[0];
                                    console.log(ans0);
                                    let ans1 = surveys[0].questions[count].questionAns[1];
                                    console.log(ans1);
                                    let ans2 = surveys[0].questions[count].questionAns[2];
                                    console.log(ans2);
                                    part["topic"] = surveys[0].questions[count].questionTopic;
                                    part[ans0['answer']] = 0;
                                    part[ans1['answer']] = 0;
                                    part[ans2['answer']] = 0;
                                    for(let player=0;player<respondents;player++){
                                    let oneAns = answers[player].questions[count].questionAns;
                                    console.log(oneAns);
                                    switch(oneAns) {
                                        case ans0['answer']:
                                        part[ans0['answer']]++;
                                        break;
                                        case ans1['answer']:
                                        part[ans1['answer']]++;
                                        break;
                                        case ans2['answer']:
                                        part[ans2['answer']]++;
                                        break;
                                        default:
                                            { }
                                        }
                                      }   
                                    }
                                    break;
                                    case 2:
                                    {
                                    let ans0 = surveys[0].questions[count].questionAns[0];
                                    console.log(ans0);
                                    let ans1 = surveys[0].questions[count].questionAns[1];
                                    console.log(ans1);
                                    let ans2 = {};
                                    if(surveys[0].questions[count].questionAns.length>2)
                                    {
                                        ans2 = surveys[0].questions[count].questionAns[2];
                                    }
                                    else
                                    {
                                        ans2 = {'answer':"NA"};
                                    }
                                    
                                    part["topic"] = surveys[0].questions[count].questionTopic;
                                    part[ans0['answer']] = 0;
                                    part[ans1['answer']] = 0;
                                    part[ans2['answer']] = 0;
                                    for(let player=0;player<respondents;player++){
                                    let oneAns = answers[player].questions[count].questionAns;
                                    console.log(oneAns);
                                    switch(oneAns) {
                                        case ans0['answer']:
                                        part[ans0['answer']]++;
                                        break;
                                        case ans1['answer']:
                                        part[ans1['answer']]++;
                                        break;
                                        case ans2['answer']:
                                        part[ans2['answer']]++;
                                        break;
                                        default:
                                            { }
                                        }
                                      }   

                                    }
                                    break;
                                    case 3:
                                    {
                                         part["topic"] = surveys[0].questions[count].questionTopic;
                                         ans0 = {'answer':"NA1"};
                                         ans1 = {'answer':"NA2"};
                                         ans2 = {'answer':"NA3"};
                                         part[ans0['answer']] = 0;
                                         part[ans1['answer']] = 0;
                                         part[ans2['answer']] = 0;
                                        for(let player=0;player<respondents;player++){
                                         part['total'] ++;
                                          }

                                    }
                                    break;
                                    default:
                                    {

                                    }
                               //end of switch block
                                }

                    result_[count] = part;

                 }

                  console.log(result_);

                  schema.Results.remove({"surveyID":id},(err,results)=>{});


                  let newResult = new schema.Results({
                      "surveyID":id,
                      "createDate":Date.now
                  });
                  console.log(newResult);
                  let keys = Object.keys(result_);
                  for(var count = 0;count<keys.length;count++)
                  {
                      let quetionTopic = result_[keys[count]]['topic'];
                      console.log(quetionTopic);
                      let singleResult = result_[keys[count]];
                      let keys_ = Object.keys(singleResult);
                      let type = result_[keys[count]]['type'];
                      let total = 0;
                      if(type==3)
                      {
                          console.log("type 3 called.")
                        total = result_[keys[count]]['total'];
      
                      }
                      else
                      {
                          total = singleResult[keys_[3]]+singleResult[keys_[4]]+singleResult[keys_[5]];
                      }

                      result_[keys[count]]['total'] = total;

                      let newSingleResult = new schema.SingleResult({
                          "questionTopic":quetionTopic,
                          "ans":{
                              "a1":keys_[3],
                              "a1result":singleResult[keys_[3]],
                               "a2":keys_[4],
                              "a2result":singleResult[keys_[4]],
                               "a3":keys_[5],
                              "a3result":singleResult[keys_[5]],
                              "total":total
                          }

                      });
                      //console.log(newSingleResult);
                      newResult.answers.push(newSingleResult);

                  }
                  console.log(newResult);
                   console.log("saved the new stastistics.");
                  schema.Results.create(newResult, (err, survey) => {
                        if(err) {
                        console.log(err);
                         res.end(err);
                        } else {
       
                         res.render('surveys/statisticsDetails', {
                             title: "view statistics",
                             surveyID:id,
                             result: result_,
                             displayName: req.user.displayName
                        });
                         }}
     
                     );
                 }
                 catch(err){
                    let userId = req.user._id;
                    //only show the surveys created by the user
                     survey.find({ user: userId }, (err, surveys) => {
                    if (err) {
                        return console.error(err);
                    }
                    else {
                     
                    //req.flash('errorMessage', 'No errors, you\'re doing fine');
                    //res.locals.messages = req.flash();
                    //alert("no one answers this survey yet.");
                     //res.redirect('/surveys/mySurveys');
                    res.render('surveys/userSurvey', {
                    title: 'My Surveys List',
                    messages: 'this survey has no answers',
                    surveys: surveys,
                    displayName: req.user.displayName,
                    });
                    }
                });
            }
          }

          });
      }
    });
}


// export to excel file.
module.exports.exportToExcel = (req, res) => {

    let id = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    console.log(id);

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
    topic_name: { // <- the key should match the actual data key 
    displayName: 'Topic', // <- Here you specify the column header 
    headerStyle: styles.headerDark, // <- Header style 
    cellStyle: function(value, row) { // <- style renderer function 
      // if the status is 1 then color in green else color in red 
      // Notice how we use another cell value to style the current one 
      return (row.status_id == 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible  
    },
    width: 120 // <- width in pixels 
  },
  first_ans: {
    displayName: 'first_ans',
    headerStyle: styles.headerDark,
    // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property 
    //   return (value == 1) ? 'Active' : 'Inactive';
    // },
    width: '10' // <- width in chars (when the number is passed as string) 
  },
  first_ans_res: {
    displayName: 'first_ans_res',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style 
    width: '10' // <- width in pixels 
  },
   second_ans: {
    displayName: 'second_ans',
    headerStyle: styles.headerDark,
    // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property 
    //   return (value == 1) ? 'Active' : 'Inactive';
    // },
    width: '10' // <- width in chars (when the number is passed as string) 
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
  [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
    {
      name: 'Sheet name', // <- Specify sheet name (optional) 
      //heading: heading, // <- Raw heading array (optional) 
      specification: specification, // <- Report specification 
      data: dataset // <-- Report data 
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





