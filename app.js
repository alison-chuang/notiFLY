import dotenv from 'dotenv';
dotenv.config();
const { PORT, API_VERSION } = process.env;

// Express Initialization
import express from 'express';
const app = express();
const port = PORT

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Altas database connection 
import db from './model/database.js'

// API routes
import campaignRouter from './routes/campaign.js'
app.use('/api/' + API_VERSION, campaignRouter);

// Page not found
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Error handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json('Internal Server Error');
});

app.listen(port, () => {
    console.log(`The application is runnung on localhost ${port}`);
});

