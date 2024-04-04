// src/utils/audioUtils.js
export const playAudio = (audioData) => {
    const base64Data = `data:audio/wav;base64,${audioData.data}`;
    fetch(base64Data)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => new AudioContext().decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        const source = new AudioContext().createBufferSource();
        source.buffer = audioBuffer;
        source.connect(new AudioContext().destination);
        source.start();
      });
  };