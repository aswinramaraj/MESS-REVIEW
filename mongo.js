const mongoose = require('mongoose')
const express = require('express')
const path = require('path')

mongoose.connect("mongodb+srv://mess:mess123@cluster0.wpwgs.mongodb.net/mess", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    
})
.then(() => {
    console.log("database connected");
    console.log("app");

})
.catch(err => {
    console.log("Error connecting to the database:", err);
});

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
});

const usermodel = mongoose.model("signups", schema);

module.exports = usermodel 