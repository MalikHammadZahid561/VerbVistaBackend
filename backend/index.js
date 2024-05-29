const express = require("express");
const app = express()
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
const corsOptions = {
  origin: ["*","http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], // replace with the origins of your client applications
  credentials: true, // allow cookies and other credentials
};
 app.use(cors(corsOptions));
const user = require("./controller/UserController");
const ErrorHandler = require("./middleware/error");

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));




app.use("/test", (req, res) => {
  res.send("Hello world!");
});
app.use("/api/v2/user", user);


app.use(ErrorHandler);

module.exports = app;   