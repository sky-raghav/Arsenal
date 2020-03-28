const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport');

//User Model
let User = require('../models/user');

//Home URL
router.get('/logging', (req,res) => {
  res.render('registerUser', {
    title:'Login/Register',
    option: {
      name: 'Event List',
      id: '/'
    }
  });
});

//User Registration
router.post('/register', [
  check('name', 'Name is required!').notEmpty(),
  check('email', 'Email is required!').notEmpty(),
  check('email', 'Email is invalid!').isEmail(),
  check('username', 'Username is required!').notEmpty(),
  check('password', 'Password is required!').notEmpty(),
  check('password2', 'Passowrds do not match!').notEmpty()
  .custom((value, { req }) => value === req.body.password)
], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length){
    console.log('Errors are ',errors);
    res.render('registerUser',{
      errors: errors,
      title:'Login/Register'
    });
  } else{
    let newUser = new User();
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.username = req.body.username;
    newUser.password = req.body.password;
    bcrypt.genSalt(10, (err,salt) =>{
      bcrypt.hash(newUser.password, salt, (err, hash) =>{
        if(err){
          console.log('Error in hashing: ',err);
        } else if (hash) {
          newUser.password = hash;
          newUser.save( (err) =>{
            if(err){
              console.log(err);
            } else{
              req.flash('success', 'You are rgistered! Please Login')
              res.redirect('/user/logging');
            }
          })
        }
      })
    })
  }
})

//user login
router.post('/login', (req, res, next) =>{
  passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/user/logging',
    failureFlash: true
  })(req, res, next);
})

router.get('/logout', (req, res) =>{
  req.logout();
  req.flash('success', 'You are logged out!');
  res.redirect('/user/logging');
})

module.exports = router;
