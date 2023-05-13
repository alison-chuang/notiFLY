import dotenv from "dotenv";
dotenv.config();
const { PORT, API_VERSION } = process.env;

import express from "express";
const app = express();
const port = PORT;
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Altas database connection
import "./util/database_connection.js";

// API routes
import campaignRouter from "./server/routes/campaign.js";
import memberRouter from "./server/routes/member.js";
import segmentRouter from "./server/routes/segment.js";
import userRouter from "./server/routes/user.js";
app.use("/api/" + API_VERSION, campaignRouter);
app.use("/api/" + API_VERSION, memberRouter);
app.use("/api/" + API_VERSION, segmentRouter);
app.use("/api/" + API_VERSION, userRouter);

// Reset password server-side render
import { wrapAsync } from "./util/util.js";
import { verifySource } from "./server/middleware/reset_password.js";
import { resetLink } from "./server/controller/user.js";
app.get("/users/password/link/:id/:token", wrapAsync(verifySource), wrapAsync(resetLink));

// Page not found
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ data: "Internal Server Error" });
});

app.listen(port, () => {
    console.log(`The application is running on localhost ${port}`);
});
