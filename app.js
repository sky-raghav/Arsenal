const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const config = require('./config/database');
const passport = require('passport');

//Connecting to db
mongoose.connect(config.db);
let db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to db');
})

db.on('error', (err) => {
  console.log(err);
})

//Express initialisation
const app = express();

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Setting Static resources path
app.use(express.static(path.join(__dirname,'./static')));

//Event Model
let Event = require('./models/event');

//Setting view engine & path
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

//express session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('*', (req, res, next) =>{
  res.locals.user = req.user || null;
  next();
})

//Routing
let events = require('./routes/events.js');
let user = require('./routes/user.js');

app.use('/events', events);
app.use('/user', user);

//Helper function
let dateFormatter = (date) => {
  let d = new Date(date);
  return d.getDate() + ' ' + date.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear()
}

app.get('/', (req,res) => {
  Event.find({}, (err, eventData)=>{
    if(err){
      console.log(err);
    } else {
      console.log("USER::",req.user);
      res.render('eventList', {
        title:'Event List',
        events: eventData,
        dateFormatter: dateFormatter,
        option: {
          name: 'Login/Register',
          id: '/user/logging'
        }
      });
    }
  });
});

//Starting Server
app.listen(3000, ()=>{
  console.log('Listening on port 3000...');
})
