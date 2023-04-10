import dotenv from "dotenv";
dotenv.config();
const { DATABASE_URL } = process.env;

import mongoose from "mongoose";
mongoose.set("debug", true);
const url = DATABASE_URL;
const db = mongoose
    .connect(url)
    .then(() => {
        console.log("Connected to database ");
    })
    .catch((err) => {
        console.error(`Error connecting to the database. \n${err}`);
    });

export default db;
