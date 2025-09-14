import React, { useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes } from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background: linear-gradient(180deg, #0b1d3f, #0f3057);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ChatBox = styled.div`
  width: 100%;
  max-width: 700px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background-color: #0d1b3f;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    height: 90vh;
    max-width: 95%;
  }
`;

const Header = styled.div`
  padding: 20px;
  background-color: #091a33;
  color: #fff;
  font-size: 1.6rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #1a365f;
  letter-spacing: 1px;
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
  background-color: ${props => (props.user ? "#3da9fc" : "#1f3c70")};
  color: ${props => (props.user ? "#000" : "#fff")};
  padding: 12px 18px;
  border-radius: 25px;
  max-width: 75%;
  font-size: 15px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.3);
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => (props.user ? "#fff" : "#3da9fc")};
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: #ccc;
  align-self: flex-end;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #091a33;
  border-top: 1px solid #1a365f;

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const TextInput = styled.input`
  flex: 1;
  padding: 14px;
  border-radius: 25px;
  border: none;
  outline: none;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 14px 20px;
  border-radius: 25px;
  border: none;
  background-color: #3da9fc;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;

  &:hover { background-color: #3590d0; }
`;

const FileButton = styled.label`
  padding: 14px 20px;
  background-color: #3da9fc;
  color: #fff;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;

  &:hover { background-color: #3590d0; }

  input { display: none; }
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
      // FormData for FastAPI Form
      const form = new FormData();
      form.append("message", input);

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        body: form
      });
      const data = await response.json();
      const botMsg = { user: false, text: data.reply, time: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
      speak(botMsg.text);
    } catch (err) {
      console.error(err);
      const errorMsg = { user: false, text: "Failed to get response. Try again.", time: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, errorMsg]);
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  const voiceInput = () => {
    if (!window.webkitSpeechRecognition) return alert("Speech recognition not supported.");
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const speak = (text) => {
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
      setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}`, time: new Date().toLocaleTimeString() }]);
    } catch (err) { console.error(err); }
  };

  const clearChat = () => setMessages([]);

  return (
    <Container>
      <ChatBox>
        <Header>Xzavior AI</Header>
        <MessagesContainer>
          {messages.map((msg, i) => (
            <Message key={i} user={msg.user}>
              {!msg.user && <Avatar />}
              {msg.text}
              <Timestamp>{msg.time}</Timestamp>
            </Message>
          ))}
          {typing && <Message user={false}><Avatar />Xzavior AI is typing...</Message>}
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
          <FileButton>
            Upload File
            <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
          </FileButton>
          <Button onClick={clearChat}>Clear</Button>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
