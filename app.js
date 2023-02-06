const express = require("express");
const bodyParser = require("body-parser");
//let path = require("path");
const baseUrl = require("./config/router/routes");

require("dotenv").config();
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let cors = require("cors");
app.use(cors());

//routes
const userRoute = require("./routes/userRoutes");




//en tête
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

//router
app.use(baseUrl.userUrl, userRoute);

module.exports = app;