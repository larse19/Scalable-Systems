// https://www.smashingmagazine.com/2021/01/dialogflow-agent-react-application/
const express = require("express");
const Dialogflow = require("@google-cloud/dialogflow");
// const { v4 } = require("uuid");
require("dotenv").config();
const Path = require("path");

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

const app = express();

const sessionClient = new Dialogflow.SessionsClient({
  keyFilename: Path.join(__dirname, "./key.json"),
});

app.post("/text-input", jsonParser, async (req, res) => {
  const { message, contexts } = req.body;
  console.log(contexts);
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
    request.queryParams = {
      contexts: contexts,
    };
  }

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

const { pipeline, Transform } = require("stream");
const busboy = require("connect-busboy");
const util = require("util");
require("util.promisify").shim();

app.use(
  busboy({
    immediate: true,
  })
);

app.post("/voice-input", (req, res) => {
  const sessionPath = sessionClient.projectAgentSessionPath(
    "scalable-systems-gcjw",
    "1234"
  );

  // transform into a promise
  const pump = util.promisify(pipeline);

  const audioRequest = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: "AUDIO_ENCODING_OGG_OPUS",
        sampleRateHertz: "16000",
        languageCode: "en-US",
      },
      singleUtterance: true,
    },
  };

  let streamData = null;
  const detectStream = sessionClient
    .streamingDetectIntent()
    .on("error", (error) => console.log(error))
    .on("data", (data) => {
      streamData = data.queryResult;
    })
    .on("end", (data) => {
      res.status(200).send({ data: streamData });
    });

  detectStream.write(audioRequest);

  try {
    req.busboy.on("file", (_, file, filename) => {
      pump(
        file,
        new Transform({
          objectMode: true,
          transform: (obj, _, next) => {
            next(null, { inputAudio: obj });
          },
        }),
        detectStream
      );
    });
  } catch (e) {
    console.log(`error  : ${e}`);
  }
});

module.exports = app;
