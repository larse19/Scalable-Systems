import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import AudioRecorder from "./Components/AudioRecorder";
import MicRecorder from "mic-recorder-to-mp3";
import Axios from "axios";

function App() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [results, setResults] = useState([]);
  const [repo, setRepo] = useState("none");
  const [audioOutput, setAudioOutput] = useState(null);
  const [responseBlob, setResponseBlob] = useState();
  const [Mp3Recorder, setMP3Recorder] = useState(new MicRecorder({ bitRate: 128 }));
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

    Axios.post(`http://localhost:5050/api/agent/voice-input`, formData, {
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

    fetch("http://localhost:5050/api/agent/text-input", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ message: message, contexts: context }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setTextResponse(response.data.text);
        setResults(response.data.results);
        setResponse(response.data.responses[0].queryResult.fulfillmentMessages[0].text.text);
        // setAudioOutput(response.data.responses[0].outputAudio.data);
        // console.log(response);
        // console.log(
        //   response.data.responses[0].queryResult.outputContexts[0].parameters
        //     .fields.repository
        // );
        setRepo(response.data.responses[0].queryResult.parameters.fields.repository.stringValue.replaceAll(" ", ""));
        if (response.data.responses[0].queryResult.outputContexts) {
          setContext(response.data.responses[0].queryResult.outputContexts);
        }

        console.log(response);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    speech.text = textResponse;
    window.speechSynthesis.speak(speech);
  }, [textResponse]);

  return (
    <div className="App">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              paddingRight: "10px",
            }}
          >
            <label>
              {"Query: "}
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
            </label>
            <button style={{ height: 20, width: 100, marginTop: 20 }} onClick={() => executeQuery(value)}>
              Submit
            </button>
            {/* <AudioRecorder onSubmit={executeVoiceQuery} /> */}
            <h2>{textResponse}</h2>
          </div>
          <div>
            <table>
              <tr>
                <th>ID</th>
                <th>Repository name</th>
                <th>Event Type</th>
                <th>Action</th>
                <th>Issue Title</th>
                <th>Issue Body</th>
                <th>User</th>
                <th>Created At</th>
                <th>Closed At</th>
              </tr>
              {results?.map((result, i) => {
                return (
                  <tr key={i}>
                    <td>{result.repoId}</td>
                    <td>{result.reponame}</td>
                    <td>{result.eventType}</td>
                    <td>{result.action}</td>
                    <td>{result.title}</td>
                    <td>{result.issueBody}</td>
                    <td>{result.user}</td>
                    <td>{result.created_at}</td>
                    <td>{result.closed_at}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
