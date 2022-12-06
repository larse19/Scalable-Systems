import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";

function App() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [repo, setRepo] = useState("none");
  const [context, setContext] = useState({
    name: "",
    lifespanCount: 0,
    parameters: {},
  });

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
            response.data[0].queryResult.outputContexts[0].parameters.fields
              .repository.stringValue
          );
          setContext(response.data[0].queryResult.outputContexts);
        }

        console.log(response);
      })
      .catch((e) => console.log(e));
  };

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
            Submite
          </button>
          <h2>{response}</h2>
        </div>
      </body>
    </div>
  );
}

export default App;
