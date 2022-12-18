import Axios from "axios";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [results, setResults] = useState([]);
  const [intent, setIntent] = useState("");
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
        setIntent(response.data.responses[0].queryResult.intent.displayName);
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
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              paddingRight: "10px",
            }}
          >
            {/* <iframe
              allow="microphone;"
              width="350"
              height="430"
              src="https://console.dialogflow.com/api-client/demo/embedded/22a9c2d1-2e0d-49b9-99f8-87c3011e180c"
            ></iframe> */}

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
          {results?.length > 0 && intent === "Open Issues" && (
            <div>
              <table>
                <tr>
                  {/* <th>ID</th> */}
                  <th>Repository name</th>
                  <th>Issue Title</th>
                  <th>Issue State</th>
                  <th>Event Type</th>
                  <th>Action</th>
                  <th>Body</th>
                  <th>User</th>
                  <th>Time of event</th>
                  <th>Created At</th>
                  <th>Closed At</th>
                </tr>
                {results?.map((result, i) => {
                  return (
                    <tr key={i}>
                      {/* <td>{result.repoId}</td> */}
                      <td>{result.reponame}</td>
                      <td>{result.title}</td>
                      <td>{result.issueState}</td>
                      <td>{result.eventType}</td>
                      <td>{result.action}</td>
                      <td>{result.issueBody ?? result.commentBody}</td>
                      <td>{result.user}</td>
                      <td>{result.eventTime}</td>
                      <td>{result.created_at}</td>
                      <td>{result.closed_at}</td>
                    </tr>
                  );
                })}
              </table>
            </div>
          )}
        </div>
      </body>
    </div>
  );
}

export default App;
