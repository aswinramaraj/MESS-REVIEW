const mongoose = require('mongoose')
const express = require('express')
const path = require('path')

mongoose.connect("mongodb+srv://mess:mess123@cluster0.wpwgs.mongodb.net/mess", {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log("database connected");
    console.log("app");

})
.catch(err => {
    console.log("Error connecting to the database:", err);
});

const schema = new mongoose.Schema({
    Date: { type: Date, required: true },
    time :{type: String, required:true},
    morningrate: { type: Number, required: true },
    afternoonrate: { type: Number, required: true },
    nightrate: { type: Number, required: true }
    
    
});

const home = mongoose.model("testover", schema);

module.exports = home 