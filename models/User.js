const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name:{
    type: 'string',
    require:true,
  },
  email: {
    type: 'string',
    require:true,
    unique:true
  },
  password: {
    require:true,
    type: 'string',
  },
  avatar:{
    type: 'string',
    require:true,
  },
  date: {
    type: Date,
    default: new Date()
  }
})

module.exports = mongoose.model('users',UserSchema);