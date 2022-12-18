// https://www.smashingmagazine.com/2021/01/dialogflow-agent-react-application/
const express = require("express");

// const { v4 } = require("uuid");
require("dotenv").config();

const app = express();

//res.status(200).send({ data: "TEXT ENDPOINT CONNECTION SUCCESSFUL" });
const text = require("./endpoints/text");
app.use(text);
const voice = require("./endpoints/voice");
app.use(voice);

module.exports = app;
