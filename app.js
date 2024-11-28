const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const port = 3000;
const hbs = require('hbs');
const app = express();
const collection = require("./mongo");
const home = require("./home");
const bodyParser = require("body-parser");
const { after } = require('node:test');
const { error } = require('console');
const nodemailer = require('nodemailer');
const schedule = require("node-schedule"); 
require('dotenv').config({path:"./pass.env"});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log("server started");
});


app.get('/', (req, res) => {
    res.render('index'); // Automatically looks for 'index.hbs' in the views directory
});

app.get('/login', (req, res) => {
    res.render('login'); // Automatically looks for 'login.hbs' in the views directory
});

app.get('/home', (req, res) => {
    res.render('home'); // Automatically looks for 'home.hbs' in the views directory
});

app.get('/rate', (req, res) => {
    res.render('home'); // Use 'home.hbs' for this route
});



app.post('/', async (req, res) => {
    const { mail, pass, name, repass } = req.body;

    try {
        // Check if the email is already registered
        const mail_check = await collection.findOne({ email: mail });
        if (mail_check) {
            return res.render(path.join(__dirname, './views/signup.hbs'), {
                email_check: "Email is already registered"
            });
        }

        // Check if passwords match
        if (pass !== repass) {
            return res.render(path.join(__dirname, './views/signup.hbs'), {
                email_check: "Passwords do not match"
            });  
        }

        // Save the data if no errors
        const data = {
            name: name,
            email: mail,
            pass: pass,
        };
        await collection.insertMany([data]);
        res.send("Data saved successfully");
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("An error occurred");
    }
});


    let today = new Date();
    let dayOfWeek = today.getDay();  // Gets the numeric representation of the day
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let currentDay = daysOfWeek[dayOfWeek];  // Maps the number to the day name
    console.log(currentDay);
    
    app.post("/home", async (req, res) => {
        try {
            const check = await collection.findOne({ email: req.body.mail });
            if (check){
                if (check && check.pass === req.body.pass) {
                res.render(path.join(__dirname, './views/home.hbs'), {
                    day: currentDay  // Pass the day to the template
                });
            } else {
                res.send("Wrong password");
            }
        }
    else{
        res.render(path.join(__dirname,"./views/login.hbs"),
    {
        not_email : "the account is not available go to index"
    })
    } }
        catch (err) {
            console.log("Error:", err);
            res.status(500).send("Error occurred during login");
        }
            
           
    });
    

    app.use(bodyParser.urlencoded({ extended: true }));

    // Handle the /review endpoint
    app.post("/rate", async (req, res) => {
        const date = new Date(); // Get the current date and time
        const hour = date.getHours(); // Extract the current hour
    

        const morningrate = req.body.morningstar;
        const afternoonrate = req.body.afternoonstar;
        const nightrate = req.body.nightstar;
        // Check if the time is before 7:00 PM
        if (hour < 19) {
            if (!morningrate || !afternoonrate || !nightrate) {
                return res.status(400).render(path.join(__dirname, "./views/home.hbs"), {
                    error: "Please provide ratings for all time periods.",
                });
            };
            return res.status(400).render(path.join(__dirname, "./views/home.hbs"), {
                error: "You can only submit ratings after 7:00 PM.",
            });

        }
    
        // Collect ratings from the request body
      
    
        // Validate that all ratings are provided
      
    
        // Prepare the data to save
        const time = date.toTimeString().split(" ")[0].slice(0, 5); // Format time as HH:MM
        const data = {
            Date: date,
            time: time,
            morningrate: morningrate,
            afternoonrate: afternoonrate,
            nightrate: nightrate,
        };
    
        try {
            // Save the data to the database
            await home.insertMany([data]);
    
            // Render a success response
            res.render(path.join(__dirname, "./views/home.hbs"), {
                success: "Ratings submitted successfully!",
            });
    
            console.log(`Ratings received: Morning: ${morningrate}, Afternoon: ${afternoonrate}, Night: ${nightrate}`);
        } catch (err) {
            console.error("Error saving ratings:", err);
            res.status(500).send("An error occurred while saving your ratings.");
        }
    });
    
         //mail section
         
         
       
       
         
         const date = new Date();
         const hour = date.getHours();
         const minute = date.getMinutes();
         const sart = new Date(date.setHours(0,0,0,0));
         const end = new Date(date.setHours(23,59,59,999));
         
         

         schedule.scheduleJob("47 14 * * *",()=>{
            home.find({Date :{$gte:sart,$lte:end }}, { morningrate: 1, afternoonrate: 1, nightrate: 1, _id: 0 })
            .then((homes) => {
                // Map rates
                const m_rate = homes.map((home) => home.morningrate).join(", ");
                const a_rate = homes.map((home) => home.afternoonrate).join(", ");
                const n_rate = homes.map((home) => home.nightrate).join(", ");
            

                  // Set up the nodemailer transporter
                  const  sender = nodemailer.createTransport({
                    service:"gmail",
                    auth : {
                        user : "aswinramaraj90@gmail.com",
                        pass : "lhxa jryc nqns ejoq"
                    }
                });
        
                var compose = {
                    from: "aswinramaraj90@gmail.com",
                    to: "ashwinkumar682005@gmail.com",
                    subject: "Daily Meal Ratings",
                    text: `Hello,\n\nHere are the daily meal ratings:\n\nMorning: ${m_rate}\nAfternoon: ${a_rate}\nNight: ${n_rate}`,
                    html: `
                        <h1>Daily Meal Ratings</h1>
                        <p><strong>Morning:</strong> ${m_rate}</p>
                        <p><strong>Afternoon:</strong> ${a_rate}</p>
                        <p><strong>Night:</strong> ${n_rate}</p>
                    `,
                };
        
                sender.sendMail(compose,function(error,info){
             if(error)
             {
                console.log(error);
             }
             else{
                console.log("maill send successfully");
             }
                });

            });
        });
            
         

     

    
