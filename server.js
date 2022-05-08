require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require ('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/dbConn');

const PORT = process.env.PORT || 3500;


connectDB();

app.use(cors())

// built-in middleware to handle urlencoded data
// in other words, form data:  
// ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

// routes
//app.use('/', require('./routes/root'));
//console.log(path.join(__dirname, 'views', 'index.html'));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'views', 'index.html')));
app.use('/states', require('./routes/api/states'));


//send 404 if error
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
