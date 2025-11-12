import React, { useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes } from "styled-components";

// ----- Styled Components -----
const Container = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
`;

// --- Header ---
const Header = styled.div`
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* Matching the image, the border is very subtle or non-existent. 
     Keeping a very dark one for separation. */
  border-bottom: 1px solid #222; 
`;

const UpgradeButton = styled.button`
  background-color: #5840bb; // Purple-blue from image
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #6a5acd;
  }
`;

// Re-usable icon button for header and input
const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #888; /* Default color for input icons */
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #222;
  }
`;

// **NEW**: Specific style for header icons to match image
const HeaderIconButton = styled(IconButton)`
  color: #ccc; /* Lighter color for header icons */
`;


// --- Chat Area ---
const ChatBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
`;

// --- Empty Chat Placeholder (UPDATED) ---
const EmptyChatContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: bold;
  color: #fff; /* Changed from #ccc to white to match image */
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
  background-color: ${props => (props.user ? "#333" : "#1abc9c")};
  color: #fff;
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

// --- Input Area ---
const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #000;
  gap: 10px;
`;

// **UPDATED**: Darker input field to match image
const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: #1a1a1a; /* Darker than #222 */
  border: 1px solid #2a2a2a; /* More subtle border */
  border-radius: 25px;
  padding: 0 10px 0 15px; 
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px 0; 
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #fff;

  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background-color: #007bff; 
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #333;
    color: #666;
    cursor: not-allowed;
  }
`;

// ----- Backend URL -----
const API_URL = "https://xzavior-ai.onrender.com";

// ----- Main App (Logic unchanged) -----
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const fileInputRef = useRef(null); 

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
    if (!file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      const data = await res.json();
      setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}`, time: new Date().toLocaleTimeString() }]);
    } catch (err) { console.error(err); }
  };
  
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Container>
      {/* Header using new HeaderIconButton */}
      <Header>
        <HeaderIconButton onClick={() => alert("Menu clicked")}>&#9776;</HeaderIconButton>
        <UpgradeButton onClick={() => alert("Upgrade clicked")}>Upgrade</UpgradeButton>
        <HeaderIconButton onClick={() => alert("History clicked")}>&#8635;</HeaderIconButton>
      </Header>
      
      <ChatBox>
        {/* Conditional "What can I help with?" message */}
        {messages.length === 0 && !typing ? (
          <EmptyChatContainer>
            What can I help with?
          </EmptyChatContainer>
        ) : (
          <MessagesContainer>
            {messages.map((msg, i) => (
              <Message key={i} user={msg.user}>
                {msg.text}
                <Timestamp>{msg.time}</Timestamp>
              </Message>
            ))}
            {typing && <Message user={false}>Xzavior AI is typing...</Message>}
          </MessagesContainer>
        )}

        {/* Input Bar using default IconButton */}
        <InputContainer>
          <IconButton onClick={handleAttachmentClick}>+</IconButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => handleFileUpload(e.target.files[0])} 
          />
          
          <InputWrapper>
            <TextInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.g.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask ChatGPT"
            />
            <IconButton onClick={() => alert("Voice input soon")}>🎤</IconButton>
          </InputWrapper>
          
          {/* Note: Kept your SendButton logic. The image has a voice button here, 
            but that would require changing logic (which you asked not to do).
          */}
          <SendButton onClick={sendMessage} disabled={!input.trim()}>
            ↑
          </SendButton>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
