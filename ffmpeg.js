const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os"); // Import os module to find the Documents folder

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports.convertToMP4 = (buffer, resolution) => {
  const tempPath = path.join(__dirname, "temp.webm");
  const documentsFolder = path.join(os.homedir(), "Documents"); // Get the Documents folder
  const outputPath = path.join(documentsFolder, `output-${resolution}.mp4`);

  console.log("Temp Path: ", tempPath);
  console.log("Output Path: ", outputPath);

  // Ensure the Documents folder exists
  if (!fs.existsSync(documentsFolder)) {
    console.error("Documents folder does not exist.");
    return;
  }

  fs.writeFileSync(tempPath, buffer);

  let scale;
  switch (resolution) {
    case "480p":
      scale = "640:480";
      break;
    case "720p":
      scale = "1280:720";
      break;
    case "1080p":
      scale = "1920:1080";
      break;
    default:
      scale = "1280:720"; // Default to 720p
  }

  ffmpeg(tempPath)
    .output(outputPath)
    .videoCodec("libx264") // Encode video with H.264 codec
    .audioCodec("aac") // Encode audio with AAC codec
    .size(scale)
    .on("end", () => {
      console.log(`File saved in your Documents folder: ${outputPath}`);
      fs.unlinkSync(tempPath); // Clean up temporary file
    })
    .on("error", (err) => {
      console.error(`Error during conversion: ${err.message}`);
      fs.unlinkSync(tempPath); // Clean up even if there's an error
    })
    .run();
};
