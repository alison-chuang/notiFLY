import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });
const { DATABASE_URL } = process.env;

// mongoose.set("debug", true);

const url = DATABASE_URL;
const Database = mongoose
    .connect(url)
    .then(() => {
        console.log("Connected to database ");
    })
    .catch((err) => {
        console.error(`Error connecting to database. \n${err}`);
    });

export default Database;
