import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
// app.get("/", (req , res) => {
//   res.send("Hello World!");
// });

export = app;
