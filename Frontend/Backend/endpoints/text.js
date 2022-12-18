require("util.promisify").shim();
const express = require("express");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const openIssues = require("../fulfillment/openIssues");

const Path = require("path");
const Dialogflow = require("@google-cloud/dialogflow");
const { stringify } = require("querystring");
const sessionClient = new Dialogflow.SessionsClient({
  keyFilename: Path.join(__dirname, "../key.json"),
});
const app = express();

app.post("/text-input", jsonParser, async (req, res) => {
  const { message, contexts } = req.body;

  // Create a new session

  const sessionPath = sessionClient.projectAgentSessionPath(
    "scalable-systems-gcjw",
    "123456"
  );

  // The dialogflow request object
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "en",
      },
    },
  };

  if (contexts && contexts.length > 0) {
    console.log(contexts);
    request.queryParams = {
      contexts: contexts,
    };
  }

  // Sends data from the agent as a response
  try {
    const responses = await sessionClient.detectIntent(request);
    const intent = responses[0].queryResult.intent.displayName;
    const response = {
      text: responses[0].queryResult?.fulfillmentText,
      results: [],
      responses,
    };
    switch (intent) {
      case "Open Issues":
        const repoName =
          responses[0].queryResult?.parameters?.fields?.repository?.stringValue;
        if (repoName) {
          const { text, results } = await openIssues(repoName);
          response.text = text;
          response.results = results;
        }
    }
    console.log(response.text, response.results);
    res.status(200).send({ data: response });
  } catch (e) {
    console.log(e);
    res.status(422).send({ e });
  }
});

module.exports = app;
