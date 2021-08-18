const mongoose = require("mongoose") ;

const cns_schema = new mongoose.Schema({
    _id:String,
    name:String,
    status:[String]
 },{_id:false});

const ses = new mongoose.model("ses",cns_schema);
module.exports=ses;