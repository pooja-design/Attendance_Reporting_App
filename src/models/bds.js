const mongoose = require("mongoose") ;//import mongoose interface to connect frontend to backend

const bds_schema = new mongoose.Schema({//define schema
    _id:String,
    name:String,
    status:[String]
 },{_id:false});

const bds = new mongoose.model("bds",bds_schema);
module.exports=bds;//to  use the schema from other modules of program.