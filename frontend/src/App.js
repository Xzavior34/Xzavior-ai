import React, { useState, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes } from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ChatBox = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled(ScrollToBottom)`
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
`;

const Message = styled.div`
  align-self: ${props => (props.user ? "flex-end" : "flex-start")};
  background-color: ${props => (props.user ? "#fff" : "#1abc9c")};
  color: ${props => (props.user ? "#000" : "#fff")};
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 75%;
  font-size: 15px;
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: #ccc;
  align-self: flex-end;
`;

const InputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background-color: #000;
  border-top: 1px solid #333;
`;

const TextInput = styled.input`
  flex: 1 1 100%;
  padding: 14px;
  border-radius: 25px;
  border: 1px solid #333;
  outline: none;
  font-size: 16px;
  background-color: #111;
  color: #fff;
`;

const CircleButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  color: #000;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;

  &:hover { background-color: #eee; }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const FileButton = styled.label`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #fff;
  color: #000;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  input { display: none; }

  &:hover { background-color: #eee; }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

// ----- Backend URL -----
const API_URL = "https://xzavior-ai.onrender.com";

// ----- Main App -----
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { user: true, text: input, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const form = new FormData();
      form.append("message", input);

      const response = await fetch(`${API_URL}/chat`, { method: "POST", body: form });
      const data = await response.json();
      // Start animated typing
      animateBotMessage(data.reply);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { user: false, text: "Failed to get response.", time: new Date().toLocaleTimeString() }]);
      setTyping(false);
    }
  };

  // Animate AI typing
  const animateBotMessage = (fullText) => {
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const partialText = fullText.slice(0, i);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && !last.user) {
          return [...prev.slice(0, -1), { ...last, text: partialText }];
        } else {
          return [...prev, { user: false, text: partialText, time: new Date().toLocaleTimeString() }];
        }
      });
      if (i >= fullText.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 25); // 25ms per character
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  const voiceInput = () => {
    if (!window.webkitSpeechRecognition) return alert("Speech recognition not supported.");
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };

  const handleFileUpload = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      const data = await res.json();
      animateBotMessage(`File "${data.filename}" processed: ${data.analysis}`);
    } catch (err) { console.error(err); }
  };

  const clearChat = () => setMessages([]);

  return (
    <Container>
      <ChatBox>
        <MessagesContainer>
          {messages.map((msg, i) => (
            <Message key={i} user={msg.user}>
              {msg.text}
              {!msg.user && <CircleButton onClick={() => speakMessage(msg.text)} style={{fontSize:"14px"}}>🔊</CircleButton>}
              <Timestamp>{msg.time}</Timestamp>
            </Message>
          ))}
          {typing && <Message user={false}>Xzavior AI is typing...</Message>}
        </MessagesContainer>

        <InputContainer>
          <TextInput
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <CircleButton onClick={sendMessage}>➡️</CircleButton>
          <CircleButton onClick={voiceInput}>🎤</CircleButton>
          <FileButton>
            📎
            <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
          </FileButton>
          <CircleButton onClick={clearChat}>🗑️</CircleButton>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
