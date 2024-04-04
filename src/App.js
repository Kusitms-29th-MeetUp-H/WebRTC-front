// src/App.js

import React from 'react';
import SignalingComponent from './components/SignalingComponent';
import VoiceChatComponent from './components/VoiceChatComponent/VoiceChatComponent';
const App = () => {
  return (
    <div>
      <h1>My App</h1>
      <SignalingComponent />
      <h1>voice</h1>
      <VoiceChatComponent />
    </div>
  );
};

export default App;