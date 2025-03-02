const mongoose = require('mongoose');
const Schema =new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:"string"
    },
    avatar:{
         type:"string",
        default: "/avatar.png"
    
    }
})
const EUsers=mongoose.model('EUsers',Schema);
module.exports=EUsers;