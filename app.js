import dotenv from "dotenv";
dotenv.config();
const { PORT, API_VERSION } = process.env;
import { wrapAsync } from "./util/util.js";
import { verifyLink } from "./controller/user.js";

// Express Initialization
import express from "express";
const app = express();
const port = PORT;
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Altas database connection
import "./model/database.js";

// API routes
import campaignRouter from "./routes/campaign.js";
import memberRouter from "./routes/member.js";
import segmentRouter from "./routes/segment.js";
import userRouter from "./routes/user.js";
app.use("/api/" + API_VERSION, campaignRouter);
app.use("/api/" + API_VERSION, memberRouter);
app.use("/api/" + API_VERSION, segmentRouter);
app.use("/api/" + API_VERSION, userRouter);

// reset password view
// TODO: 開一個 view 的 router 再把這個註冊進去
app.get("/users/password/link/:id/:token", wrapAsync(verifyLink));

// Page not found
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Error handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json("Internal Server Error");
});

app.listen(port, () => {
    console.log(`The application is runnung on localhost ${port}`);
});
