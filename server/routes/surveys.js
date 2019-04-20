
// modules required for routing
let express = require('express');
let router = express.Router();


// require the users controller for authentication
let usersController = require('../controllers/users');
let auth = usersController.auth;

// require the survey controller 
let surveysController = require('../controllers/surveys');


// Get /initial - Display create survey initial page
router.get('/index',auth,(req,res,next)=>{
  surveysController.DisplayInitialPage(req,res);
});

router.post('/index',auth,(req,res,next) =>  {
  surveysController.DisplayAddPage(req,res);
});

// get -- all surveys list 
router.get('/',(req,res,next)=>{
    surveysController.DisplaySurveyList(req,res);
});

// get -- surveys list by user id
router.get('/userSurveys',auth,(req,res,next)=>{
   surveysController.DisplayUserSurvey(req,res);
});


// get -- the create page to create new survey
router.get('/create', auth,(req,res,next)=>{
    surveysController.DisplayAddSurvey(req,res);
});
// post -- process to save the new survey to db
router.post('/create',auth,(req,res,next)=>
{
    console.log("try to save");
    surveysController.ProcessAddSurvey(req,res);
});

// get -- Display survey page by survey id
router.get('/response/:id', (req, res, next) => {
    surveysController.DisplayResponsePage(req, res);
});

// post -- save survey respond to Db
router.post('/response/:id', (req, res, next) => {
    surveysController.ProcessResponsePage(req, res);
});

// get -- display the survey detail page
router.get('/view/:id',auth, (req, res, next) => {
  surveysController.DisplaySurveyDetails(req, res);
});

// get -- process the delete survey by survey id
router.get('/delete/:id',auth, (req, res, next) => {
  surveysController.DeleteSurvey(req, res);
});

// get -- view the  survey statistics by survey id
router.get('/statistics/:id',auth, (req, res, next) => {
  surveysController.ViewSurveyStatistics(req, res);
});

// get -- export  survey statistics by survey id
router.get('/excel/:id',auth, (req, res, next) => {
  surveysController.exportToExcel(req, res);
});

module.exports = router;