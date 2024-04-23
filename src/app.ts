import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/auth/auth.route";
// import { morgan } from "morgan";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/auth", auth);

export = app;
