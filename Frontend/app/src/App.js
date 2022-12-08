import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import AudioRecorder from "./Components/AudioRecorder";
import MicRecorder from "mic-recorder-to-mp3";
import Axios from "axios";

function App() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [repo, setRepo] = useState("none");
  const [audioOutput, setAudioOutput] = useState(null);
  const [responseBlob, setResponseBlob] = useState();
  const [Mp3Recorder, setMP3Recorder] = useState(
    new MicRecorder({ bitRate: 128 })
  );
  const [context, setContext] = useState({
    name: "",
    lifespanCount: 0,
    parameters: {},
  });

  let speech = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  speech.voice = voices[7];
  speech.volume = 1; // From 0 to 1
  speech.rate = 1; // From 0.1 to 10
  speech.pitch = 1; // From 0 to 2
  speech.lang = "dk-da";

  const executeVoiceQuery = (blob) => {
    console.log(blob);
    const inputFile = new File([blob], "input.mp3", {
      type: "audio/mp3",
    });
    const formData = new FormData();
    formData.append("voiceInput", inputFile);

    Axios.post(`http://localhost:5000/api/agent/voice-input`, formData, {
      headers: {
        "Content-Type": "multipart/formdata",
      },
    })
      .then((data) => {
        console.log(data);
      })
      .catch((e) => console.log(`error uploading audio file : ${e}`));
  };

  const executeQuery = (message) => {
    console.log(message);

    fetch("http://localhost:5000/api/agent/text-input", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ message: message, contexts: context }),
    })
      .then((response) => response.json())
      .then((response) => {
        setResponse(
          response.data[0].queryResult.fulfillmentMessages[0].text.text
        );
        setAudioOutput(response.data[0].outputAudio.data);
        console.log(response);
        console.log(
          response.data[0].queryResult.outputContexts[0].parameters.fields
            .repository
        );
        if (
          response.data[0].queryResult.outputContexts[0].parameters.fields
            .repository
        ) {
          setRepo(
            response.data[0].queryResult.outputContexts[0].parameters.fields.repository.stringValue.replaceAll(
              " ",
              ""
            )
          );
          setContext(response.data[0].queryResult.outputContexts);
        }

        console.log(response);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    speech.text = response;
    window.speechSynthesis.speak(speech);
    if (audioOutput) {
      const _url = URL.createObjectURL(audioOutput);
      setResponseBlob(_url);
    }
  }, [response, audioOutput]);

  return (
    <div className="App">
      <body className="App-header">
        <h1>
          Checked out repository: <p>{repo}</p>
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label>
            {"Query: "}
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button
            style={{ height: 20, width: 100, marginTop: 20 }}
            onClick={() => executeQuery(value)}
          >
            Submit
          </button>
          <AudioRecorder onSubmit={executeVoiceQuery} />
          <h2>{response}</h2>
          <audio src={responseBlob} controls="controls" />
        </div>
      </body>
    </div>
  );
}

export default App;
