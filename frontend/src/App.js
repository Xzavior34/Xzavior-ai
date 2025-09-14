import React, { useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes } from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  padding: 15px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #222;
`;

const ChatBox = styled.div`
  flex: 1;
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
  align-items: center;
  padding: 10px;
  background-color: #000;
  border-top: 1px solid #222;
  gap: 8px;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: #111;
  border: 1px solid #333;
  border-radius: 25px;
  padding: 5px 10px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #fff;
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #1abc9c;
  color: #fff;
  font-size: 18px;
  cursor: pointer;

  &:hover { background-color: #16a085; }
`;

const CircleButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #fff;
  color: #000;
  font-size: 18px;
  cursor: pointer;

  &:hover { background-color: #eee; }
`;

const FileButton = styled.label`
  width: 40px;
  height: 40px;
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
      const botMsg = { user: false, text: data.reply, time: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { user: false, text: "Failed to get response.", time: new Date().toLocaleTimeString() }]);
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  const handleFileUpload = async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      const data = await res.json();
      setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}`, time: new Date().toLocaleTimeString() }]);
    } catch (err) { console.error(err); }
  };

  return (
    <Container>
      <Header>Xzavior AI</Header>
      <ChatBox>
        <MessagesContainer>
          {messages.map((msg, i) => (
            <Message key={i} user={msg.user}>
              {msg.text}
              <Timestamp>{msg.time}</Timestamp>
            </Message>
          ))}
          {typing && <Message user={false}>Xzavior AI is typing...</Message>}
        </MessagesContainer>

        <InputContainer>
          <InputWrapper>
            <TextInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <SendButton onClick={sendMessage}>➡️</SendButton>
          </InputWrapper>
          <CircleButton onClick={() => alert("Voice input soon")}>🎤</CircleButton>
          <FileButton>
            📎
            <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
          </FileButton>
          <CircleButton onClick={() => setMessages([])}>🗑️</CircleButton>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
