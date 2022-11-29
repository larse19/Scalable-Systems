import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";

function App() {
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [context, setContext] = useState();

  const executeQuery = (message) => {
    console.log(message);
    fetch("http://localhost:5000/api/agent/text-input", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ message: message, context: context }),
    })
      .then((response) => response.json())
      .then((response) => {
        setResponse(
          response.data[0].queryResult.fulfillmentMessages[0].text.text
        );
        setContext(response.data[0].queryResult.outputContexts);
        console.log(response);
      })
      .catch((e) => console.log(e));
  };

  const handleSubmit = (event) => {
    executeQuery(value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Theis Lugter</p>

        <label>
          Query:
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          style={{ height: 20, width: 100 }}
          onClick={() => executeQuery(value)}
        >
          Submite
        </button>
        <h2>{response}</h2>
      </header>
    </div>
  );
}

export default App;
