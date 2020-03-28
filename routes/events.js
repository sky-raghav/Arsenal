const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//Event Model
let Event = require('../models/event');

let dateFormatter2 = (date) => {
  let d = new Date(date);
  return d.getFullYear() + (d.getMonth()>9 ? '-' : '-0') + (d.getMonth() + 1) + '-' + d.getDate()
}

let ensureAuthentication = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  } else{
    req.flash('danger', 'Please login first!');
    res.redirect('/user/logging');
  }
}

//Adding event
router.get('/addEvent', ensureAuthentication, (req,res) => {
  console.log("USER::",req.user);
  res.render('addEvent', {
    title:'Add Event'
  });
});

router.post('/addEvent', [
  check('title', 'Title is missing!').notEmpty(),
  check('date', 'Date is missing!').notEmpty(),
  check('description', 'Description is missing!').notEmpty()
  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req).errors;
    if(errors.length){
      console.log('Errors are ',errors);
      res.render('addEvent',{
        errors: errors,
        title:'Add Event'
      })
    } else{
      let event = new Event();
      console.log(req.user);
      event.title = req.body.title;
      event.organiser_id = req.user._id;
      event.organiser_name = req.user.name;
      event.date = req.body.date;
      event.description = req.body.description;
      event.save( (err) => {
        if(err){
          console.log(err);
          return;
        } else{
          req.flash('success', 'Event Added!');
          res.redirect('/');
        }
      });
    }
  }
);

//Editing Event
router.get('/editEvent/:id', ensureAuthentication, (req, res)=>{
  Event.findById(req.params.id, (err, event)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log('Edit Event:::',event,req.user);
      if(event.organiser_id != req.user._id){
        req.flash('danger', 'Not Authorized!');
        return res.redirect('/');
      }
      console.log(event);
      let newEvent = {
        _id: event._id,
        title: event.title,
        date: dateFormatter2(event.date),
        description: event.description
      }
      console.log(newEvent);
      res.render('editEvent',{
        title: 'Edit Event',
        event: newEvent
      })
    }
  })
})

router.post('/updateEvent/:id', ensureAuthentication, (req, res) => {
  console.log(req.body);
  let event = {};
  event.title = req.body.title;
  event.organiser_id = req.user._id;
  event.organiser_name = req.user.name;
  event.date = req.body.date;
  event.description = req.body.description;
  let query = { _id: req.params.id };
  Event.update(query, event, (err) => {
    if(err){
      console.log(err);
    } else{
      res.redirect('/');
    }
  });
});

//Deleting event
router.get('/deleteEvent/:id', ensureAuthentication, (req, res) =>{
  if(!req.user._id){
    req.flash('danger', 'Not Authorized!');
    res.status(500).send();
  }
  let query = {_id: req.params.id};
  Event.findById(req.params.id, (err, event) =>{
    if(event.organiser_id != req.user._id){
      req.flash('danger', 'Not Authorized!');
      return res.redirect('/');
    } else{
      Event.deleteOne(query, (err) =>{
        if(err){
          console.log(err);
        }
        else{
          req.flash('danger', 'Event Deleted!')
          res.redirect('/');
        }
      })
    }
  })
})

module.exports = router;
