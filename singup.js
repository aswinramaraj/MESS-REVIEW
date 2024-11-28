const express = require('express');
const mongoose = require('mongoose');
const port = 3000;

const app = express();

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
    console.log("server started");
});







app.get('/', (req, res) => {
    res.sendFile(__dirname + "/singup.html");
});
