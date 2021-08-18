const mongoose=require("mongoose");

const login_schema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})

const Student=new mongoose.model("Student",login_schema);
module.exports=Student;