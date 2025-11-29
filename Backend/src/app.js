import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
// For accepting the json Data

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Used for performing the CRUD operation on the users Session Cookies

// ******************************************************************************************************

import userRouter from "./routes/user.route.js";
import playlistRouter from "./routes/playlist.route.js";
import videoRouter from "./routes/video.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js";
import commentRouter from "./routes/comment.route.js";
import tweetRouter from "./routes/tweet.route.js";
import likeRouter from "./routes/like.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import subscriptionRouter from "./routes/subscription.route.js";

// ******************************************************************************************************
app.use("/api/v1/users", userRouter); // for middleware you use "use" not "on" which is for listening events which are emitted
// here we dont write the get or post because routes are defined in other files
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);
// ******************************************************************************************************
// Admin DashBoard Route
app.use("/api/v1/dashboard", dashboardRouter);

// ******************************************************************************************************

export { app };
