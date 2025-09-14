import React, { useState, useEffect, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background-color: #0b1d3f; // premium dark blue
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ChatBox = styled.div`
  width: 100%;
  max-width: 700px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  overflow: hidden;
  background-color: #0f2a57;
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
`;

const Header = styled.div`
  padding: 15px;
  background-color: #091a33;
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #1a365f;
`;

const MessagesContainer = styled(ScrollToBottom)`
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  background-color: #0f3057;
`;

const Message = styled.div`
  align-self: ${props => (props.user ? "flex-end" : "flex-start")};
  background-color: ${props => (props.user ? "#3da9fc" : "#1f3c70")};
  color: ${props => (props.user ? "#000" : "#fff")};
  padding: 12px 18px;
  border-radius: 20px;
  max-width: 75%;
  word-wrap: break-word;
  font-size: 15px;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #091a33;
  gap: 5px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  outline: none;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 12px;
  background-color: #3da9fc;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
`;

// ----- Backend URL -----
const API_URL = "https://xzavior-ai.onrender.com";

// ----- Main App -----
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  // Load chat history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setMessages(saved);
  }, []);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Initialize WebSocket
  useEffect(() => {
    ws.current = new WebSocket(`${API_URL.replace(/^http/, "ws")}/ws`);

    ws.current.onmessage = (event) => {
      const botMsg = { user: false, text: event.data };
      setMessages(prev => [...prev, botMsg]);
      speak(botMsg.text);
    };

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
  }, []);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    ws.current.send(input);
    setMessages(prev => [...prev, { user: true, text: input }]);
    setInput("");
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  // Voice input
  const voiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  // File upload
  const handleFileUpload = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: form
    });
    const data = await res.json();
    setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}` }]);
  };

  return (
    <Container>
      <ChatBox>
        <Header>Xzavior AI</Header>
        <MessagesContainer>
          {messages.map((msg, i) => (
            <Message key={i} user={msg.user}>{msg.text}</Message>
          ))}
        </MessagesContainer>
        <InputContainer>
          <TextInput
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <Button onClick={sendMessage}>Send</Button>
          <Button onClick={voiceInput}>🎤</Button>
          <input
            type="file"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: "inline-block", borderRadius: "12px", padding: "8px" }}
          />
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
