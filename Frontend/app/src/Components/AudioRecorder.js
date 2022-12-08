//https://guymanzurola.medium.com/recording-upload-audio-from-reactjs-c127235b909e
import React, { useState, useEffect } from "react";
import Axios from "axios";
import MicRecorder from "mic-recorder-to-mp3";

const AudioRecorder = ({ onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [Mp3Recorder, setMP3Recorder] = useState(
    new MicRecorder({ bitRate: 128 })
  );

  useEffect(() => {
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  }, []);

  const start = () => {
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  };

  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const _blobURL = URL.createObjectURL(blob);
        console.log(blob);
        setBlobURL(_blobURL);
        onSubmit(blob);
        setIsRecording(false);
      })
      .catch((e) => console.log(e));
  };

  return (
    <div>
      <button onClick={start} disabled={isRecording}>
        Record
      </button>
      <button onClick={stop} disabled={!isRecording}>
        Stop
      </button>
      <audio src={blobURL} controls="controls" />
    </div>
  );
};

export default AudioRecorder;
