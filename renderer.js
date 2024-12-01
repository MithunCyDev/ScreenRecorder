// Get references to DOM elements
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const preview = document.getElementById("preview");
const resolutionDropdown = document.getElementById("resolution");

let mediaRecorder;
let recordedChunks = [];

// Call the exposed API from preload.js
window.electron
  .getSources()
  .then((sources) => {
    console.log("Available screen sources:", sources); // Log the screen sources received
  })
  .catch((err) => {
    console.error("Error fetching sources:", err); // Handle any error that occurs
  });

startButton.onclick = async () => {
  // Get screen sources from the main process
  const sources = await window.electron.getSources();
  const screenSource = sources[0]; // Capture the first screen source

  // Capture system audio and screen video
  const screenConstraints = {
    audio: {
      mandatory: {
        chromeMediaSource: "desktop",
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: screenSource.id,
      },
    },
  };

  // Capture microphone audio
  const micConstraints = { audio: true };

  // Get both streams
  const screenStream = await navigator.mediaDevices.getUserMedia(
    screenConstraints
  );
  const micStream = await navigator.mediaDevices.getUserMedia(micConstraints);

  // Combine video and audio tracks into a single stream
  const combinedStream = new MediaStream([
    ...screenStream.getVideoTracks(),
    ...screenStream.getAudioTracks(), // System audio
    ...micStream.getAudioTracks(), // Microphone audio
  ]);

  preview.srcObject = combinedStream;
  preview.play();

  mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: "video/webm; codecs=vp9",
  });

  recordedChunks = []; // Reset recorded chunks

  mediaRecorder.ondataavailable = (event) => {
    recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });

    // Pass the raw video data (arrayBuffer) to the main process for conversion
    const buffer = await blob.arrayBuffer();
    const resolution = resolutionDropdown.value;

    // Send data to the main process via IPC
    const result = await window.electron.convertVideo(buffer, resolution);

    if (result.success) {
      console.log("Video conversion was successful!");
    } else {
      console.error("Error during conversion:", result.error);
    }
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
};
