// src/services/voiceChatService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { playAudio } from '../utils/audioUtils';

let stompClient;
let mediaRecorder;
let audioChunks; // 함수들 사이에서 공유될 변수로 전역 범위로 이동

export const connectToVoiceChat = () => {
  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/voice', (message) => {
      const audioData = JSON.parse(message.body);
      playAudio(audioData);
    });
    }, (error) => {
    // 연결 실패 시 로그 출력
    console.error("Could not connect to voice chat server:", error);
  });
};

export const disconnectFromVoiceChat = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect();
  }
};

export const startCapture = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = []; // 오디오 조각을 저장할 배열 초기화
  
        // 데이터 사용 가능 시, audioChunks 배열에 데이터 추가
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
  
        mediaRecorder.start();
      });
  };
  
  export const stopCapture = (callback) => { // 콜백 매개변수 추가
    if (mediaRecorder) {
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks); // 수정된 범위 내에서 audioChunks 사용
        callback(audioBlob); // 콜백 함수에 Blob 전달
      });
  
      mediaRecorder.stop();
    }
  };

  // 음성 데이터를 서버에 전송하고 응답을 처리하는 함수
export const sendAudioData = (audioBlob) => {
    if (!stompClient || !stompClient.connected) {
      console.error("Stomp client is not connected.");
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      
      // 서버로 음성 데이터 전송
      stompClient.send('/app/voice', {}, JSON.stringify({ data: base64Data }));
      
      // 서버 응답을 기다리는 구독 생성
      const subscription = stompClient.subscribe('/topic/voiceResponse', (message) => {
        // 응답 처리 로직
        const response = JSON.parse(message.body);
        
        if (response.audioUrl) {
          // 예: 서버로부터 받은 오디오 URL로 오디오를 재생
          playAudio(response.audioUrl);
          // 혹은 response.audioUrl을 사용자에게 제공하여 다운로드할 수 있게 함
        }
        
        // 필요한 응답 처리 후 구독 해제
        subscription.unsubscribe();
      });
    };
    reader.readAsDataURL(audioBlob);
  };
  
  