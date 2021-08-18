const mongoose = require("mongoose");

const login_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const Teacher = new mongoose.model("Teacher", login_schema);
module.exports = Teacher;