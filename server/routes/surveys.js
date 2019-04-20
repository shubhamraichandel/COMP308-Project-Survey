
// modules required for routing
let express = require('express');
let router = express.Router();


// require the users controller for authentication
let usersController = require('../controllers/users');

// require the survey controller 
let surveysController = require('../controllers/surveys');


// Get /initial - Display create survey initial page
router.get('/initial',usersController.RequireAuth,(req,res,next)=>{
  surveysController.DisplayInitialPage(req,res);
});

router.post('/initial',usersController.RequireAuth,(req,res,next) =>  {surveysController.GotoCreatePage(req,res)});

// get -- all surveys list 
router.get('/',(req,res,next)=>{
    surveysController.ReadSurveyList(req,res);
});

// get -- surveys list by user id
router.get('/mySurveys',usersController.RequireAuth,(req,res,next)=>{
   surveysController.ReadUserSurvey(req,res);
});


// get -- the create page to create new survey
router.get('/create', usersController.RequireAuth,(req,res,next)=>{
    surveysController.DisplayAdd(req,res);
});
// post -- process to save the new survey to db
router.post('/create',usersController.RequireAuth,(req,res,next)=>
{
    console.log("try to save");
    surveysController.CreateSurvey(req,res);
});

// get -- Display survey page by survey id
router.get('/response/:id', (req, res, next) => {
    surveysController.DisplayResponse(req, res);
});

// post -- save survey respond to Db
router.post('/response/:id', (req, res, next) => {
    surveysController.ResponseSurvey(req, res);
});

// get -- display the survey detail page
router.get('/view/:id',usersController.RequireAuth, (req, res, next) => {
  surveysController.ViewMySurvey(req, res);
});

// get -- process the delete survey by survey id
router.get('/delete/:id',usersController.RequireAuth, (req, res, next) => {
  surveysController.DeleteSurvey(req, res);
});

// get -- view the  survey statistics by survey id
router.get('/statistics/:id',usersController.RequireAuth, (req, res, next) => {
  surveysController.ViewSurveyStatistics(req, res);
});

// get -- export  survey statistics by survey id
router.get('/excel/:id',usersController.RequireAuth, (req, res, next) => {
  surveysController.exportToExcel(req, res);
});

module.exports = router;