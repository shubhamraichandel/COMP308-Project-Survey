
// modules required for routing
let express = require('express');
let router = express.Router();

// require the users controller
let usersController = require('../controllers/users');

// GET /login - render the login view
router.get('/login', (req, res, next)=>{
  usersController.DisplayLogin(req, res);
  // POST /login - process the login attempt
}).post('/login', usersController.ProcessLogin());

// GET /register - render the registration view
router.get('/register', (req, res, next)=>{
   usersController.DisplayRegistration(req, res);
}).post('/register', (req, res, next)=>{
  // POST / register - process the registration submission
  usersController.ProcessRegistration(req, res);
});

// GET /logout - process the logout request
router.get('/logout', (req, res, next)=>{
  usersController.ProcessLogout(req, res);
});

// GET the User profile Details page in order to edit profile
router.get('/profile', usersController.RequireAuth, (req, res, next) => {
//res.render('auth/profile', { user: req.user });
usersController.DisplayEdit(req, res);

}).post('/profile', usersController.RequireAuth, (req, res, next) => {
  // POST - process the information passed from the details form and update the document
  usersController.UpdateProfile(req, res);
});

module.exports = router;
