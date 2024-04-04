import React, { useEffect, useState } from 'react';
import { startCapture, stopCapture, sendAudioData, connectToVoiceChat, disconnectFromVoiceChat } from '../../services/voiceChatService';

const VoiceChatComponent = () => {
  const [serverResponse, setServerResponse] = useState(''); // 서버 응답을 저장할 상태

  useEffect(() => {
    connectToVoiceChat(); // 컴포넌트가 마운트될 때 WebSocket 연결
    return () => {
      disconnectFromVoiceChat(); // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
    };
  }, []);

  const handleStartCapture = () => {
    startCapture();
  };

  const handleStopCapture = () => {
    stopCapture((audioBlob) => {
      sendAudioData(audioBlob, setServerResponse); // 서버 응답 처리를 위해 setServerResponse 콜백 전달
    });
  };

  return (
    <div>
      <button onClick={handleStartCapture}>Start Recording</button>
      <button onClick={handleStopCapture}>Stop Recording</button>
      {serverResponse && <p>Server Response: {serverResponse}</p>} {/* 서버 응답 표시 */}
    </div>
  );
};

export default VoiceChatComponent;
