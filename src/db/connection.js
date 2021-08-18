const mongoose=require("mongoose");//import mongoose
mongoose.connect("mongodb://localhost:27017/sample_database",{//connect with sample_database and display status
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log(`connection successful`)
}).catch(()=>{
    console.log(`no connection`)
});