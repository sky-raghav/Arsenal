let mongoose = require('mongoose');

let eventSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  organiser_id:{
    type: String,
    required: true
  },
  organiser_name:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  description:{
    type: String,
    required: true
  }
})

let Events = module.exports = mongoose.model('Event', eventSchema);
