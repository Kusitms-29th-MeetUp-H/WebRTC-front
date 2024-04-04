import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const SignalingComponent = () => {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket, {
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.connect({}, () => {
      setConnected(true);
      stompClient.subscribe('/topic/signal', (message) => {
        const signalMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, signalMessage]);
      });
    });

    stompClientRef.current = stompClient;

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const signalMessage = {
        type: 'message',
        sender: 'user1',
        receiver: 'user2',
        data: message,
      };
      stompClientRef.current.send('/app/signal', {}, JSON.stringify(signalMessage));
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Signaling Component</h1>
      <p>Connected: {connected ? 'Yes' : 'No'}</p>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.data}</li>
        ))}
      </ul>
    </div>
  );
};

export default SignalingComponent;