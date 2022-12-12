const { pipeline, Transform } = require("stream");
const busboy = require("connect-busboy");
const util = require("util");
require("util.promisify").shim();
const express = require("express");

const Path = require("path");
const Dialogflow = require("@google-cloud/dialogflow");
const sessionClient = new Dialogflow.SessionsClient({
  keyFilename: Path.join(__dirname, "../key.json"),
});
const app = express();

app.post("/voice-input", (req, res) => {
  const sessionPath = sessionClient.projectAgentSessionPath(
    "scalable-systems-gcjw",
    "12345"
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
      streamData = { data: data.queryResult, audio: data.outputAudio };
      console.log(data);
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
      )
        .then((res) => console.log("res", res))
        .catch((e) => console.log("--erppr", e));
    });
  } catch (e) {
    console.log(`error  : ${e}`);
  }
});

module.exports = app;
