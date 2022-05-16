const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema({
  user:{
    type:Schema.Types.ObjectId,
    ref:'users'
  },
  text:{
    type:String,
    required:true
  },
  name:{
    type:String,
    required:true
  },
  avatar:{
    type:String,
  },
  likes:[{
    user:{
      type:Schema.Types.ObjectId,
      ref:'users'
    },
  }],
  comments:[{
    user:{
      type:Schema.Types.ObjectId,
      ref:'users'
    },
    text:{
      type:String,
      required:true
    },
    name:{
      type:String,
    },
    avatar:{
      type:String,
    },
    date:{
      type:Date,
      default:new Date
    }
  }],
  date:{
    type:Date,
    default:new Date
  }
})

module.exports =mongoose.model('post',Post)