
let mongoose = require('mongoose');
let passport = require('passport');

// define the user model
let UserModel = require('../models/users');
let User = UserModel.User; // alias for User Model - User object

module.exports.DisplayLogin = (req, res) => {
// check to see if the user is not already logged in
  if(!req.user) {
    // render the login page
    res.render('auth/login', {
      title: "Login",
      games: '',
      messages: req.flash('error'),
      displayName: req.user ? req.user.displayName : ''
    });
    return;
  } else {
    return res.redirect('/surveys/mySurveys'); // redirect to survey list
  }
}

// Processes the Login Request
module.exports.ProcessLogin = () => {
  return passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
})
}

// Displays registration page
module.exports.DisplayRegistration = (req, res) => {
  // check to see if the user is not already logged in
  if(!req.user) {
    // render the registration page
      res.render('auth/register', {
      title: "Register",
      games: '',
      messages: req.flash('registerMessage'),
      displayName: req.user ? req.user.displayName : ''
    });
    return;
  } else {
    return res.redirect('/surveys/mySurveys'); // redirect to survey list
  }
}

// Process the registration page
module.exports.ProcessRegistration = (req, res) => {
  User.register(
    new User({
      username: req.body.username,
      //password: req.body.password,
      email: req.body.email,
      displayName: req.body.displayName
    }),
    req.body.password,
    (err) => {
      if(err) {
        console.log('Error inserting new user');
        if(err.name == "UserExistsError") {
          req.flash('registerMessage', 'Registration Error: User Already Exists');
        }
        return res.render('auth/register', {
          title: "Register",
          games: '',
          messages: req.flash('registerMessage'),
          displayName: req.user ? req.user.displayName : ''
        });
      }
      // if registration is successful
      return passport.authenticate('local')(req, res, ()=>{
        res.redirect('/');
      });
    });
}

// Process the Logout request
module.exports.ProcessLogout = (req, res) => {
  req.logout();
  res.redirect('/'); // redirect to the home page
}

  // create a function to check if the user is authenticated
module.exports.RequireAuth = (req, res, next) => {
  // check if the user is logged in
  if(!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }
  next();
}

// Displays the Profile page to Update user profile
// find the user by id and populate the form
module.exports.DisplayEdit = (req, res) => {
  try {
      // get a reference to the id from the url
       let id = req.user._id;
       console.log(id);
        // find one User by its id
       User.findById(id, (err, users) => {
        if(err) {
          console.log(err);
          res.end(error);
        } else {
          // show the user profile details view
          res.render('auth/profile', {
              title: 'User Profile',
              users: users,
              messages: req.flash('updateMessage'),
              displayName: req.user.displayName
          });
        }
      });
    } catch (err) {
      console.log(err);
      res.redirect('/errors/404');
    }
}

// Update an existing User profile in the users collection
module.exports.UpdateProfile = (req, res) => {
  // get a reference to the id from the url
    let id = req.user._id;

     let updatedProfile = User({
       "_id": id,
      "email": req.body.email,
      "username": req.body.username,
      "displayName": req.body.displayName
    });
  //  req.body.password,

    User.update({_id: id}, updatedProfile, (err) => {
      if(err) {
        console.log(err);
        res.end(err);
      } else {
        // refresh the survey List
        res.redirect('/surveys/mySurveys');
      }
    });
}