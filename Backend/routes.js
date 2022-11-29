const express = require("express");
const Dialogflow = require("@google-cloud/dialogflow");
const { v4 } = require("uuid");
require("dotenv").config();
const Path = require("path");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

const app = express();

app.post("/text-input", jsonParser, async (req, res) => {
  const { message, context } = req.body;
  console.log(message);
  // Create a new session
  const sessionClient = new Dialogflow.SessionsClient({
    keyFilename: Path.join(__dirname, "./key.json"),
  });

  const sessionPath = sessionClient.projectAgentSessionPath(
    "scalable-systems-gcjw",
    v4()
  );

  // The dialogflow request object
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        languageCode: "en",
      },
      context: context,
    },
  };

  // Sends data from the agent as a response
  try {
    const responses = await sessionClient.detectIntent(request);
    res.status(200).send({ data: responses });
  } catch (e) {
    console.log(e);
    res.status(422).send({ e });
  }
});
//res.status(200).send({ data: "TEXT ENDPOINT CONNECTION SUCCESSFUL" });

app.post("/voice-input", (req, res) => {
  res.status(200).send({ data: "VOICE ENDPOINT CONNECTION SUCCESSFUL" });
});

module.exports = app;
