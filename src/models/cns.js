const mongoose = require("mongoose") ;

const cns_schema = new mongoose.Schema({
    _id:String,
    name:String,
    status:[String]
 },{_id:false});

const cns = new mongoose.model("CN",cns_schema);
module.exports=cns;