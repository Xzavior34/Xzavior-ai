import React, { useState, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background-color: #0b1d3f;
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
  font-size: 1.6rem;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  position: relative;
`;

const Timestamp = styled.span`
  display: block;
  font-size: 10px;
  color: #ccc;
  margin-top: 4px;
  text-align: right;
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
  transition: 0.2s;
  &:hover {
    background-color: #3590d0;
  }
`;

// ----- Backend URL -----
const API_URL = "https://xzavior-ai.onrender.com";

// ----- Main App -----
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Load chat history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setMessages(saved);
  }, []);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Send message via HTTP POST
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { user: true, text: input, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const botMsg = { user: false, text: data.reply, time: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMsg]);
      speak(botMsg.text);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMsg = { user: false, text: "Failed to get response. Try again.", time: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  // Voice input
  const voiceInput = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  // Text-to-speech
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  };

  // File upload
  const handleFileUpload = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      const data = await res.json();
      setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}`, time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  return (
    <Container>
      <ChatBox>
        <Header>Xzavior AI</Header>
        <MessagesContainer>
          {messages.map((msg, i) => (
            <Message key={i} user={msg.user}>
              {msg.text}
              <Timestamp>{msg.time}</Timestamp>
            </Message>
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
