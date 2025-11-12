import React, { useState, useRef, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes } from "styled-components";

// --- Speech Recognition Setup ---
// This checks if the browser supports the Web Speech API
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false; // Stop when user pauses
  recognition.lang = "en-US";
  recognition.interimResults = true; // Show results as they come
}

// ----- Styled Components -----
const Container = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #fff;
`;

const Header = styled.div`
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #222; 
`;

const UpgradeButton = styled.button`
  background-color: #5840bb;
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

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => (props.isRecording ? '#ff4136' : '#888')}; // Red when recording
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

const HeaderIconButton = styled(IconButton)`
  color: #ccc;
`;

const ChatBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
`;

const EmptyChatContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
`;

// --- UPDATED: More spacious message container ---
const MessagesContainer = styled(ScrollToBottom)`
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px; /* Increased gap */
  overflow-y: auto;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
`;

// --- UPDATED: Message layout and styling ---
const Message = styled.div`
  /* --- THIS IS THE FIX: User=flex-start (Left), AI=flex-end (Right) --- */
  align-self: ${props => (props.user ? "flex-start" : "flex-end")};
  
  /* User color is grey, AI color is green */
  background-color: ${props => (props.user ? "#333" : "#1abc9c")};
  color: #fff;
  
  /* --- Increased padding for "spacious" feel --- */
  padding: 14px 20px;
  border-radius: 20px;
  max-width: 75%;
  font-size: 15px;
  
  /* --- Increased line height for readability --- */
  line-height: 1.5;
  word-wrap: break-word; /* Fixes long words */
  
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: #ccc;
  /* Align timestamp to the end of the bubble */
  align-self: flex-end; 
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #000;
  gap: 10px;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: #1a1a1a; 
  border: 1px solid #2a2a2a; 
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

// ----- Main App (Logic Updated for VN) -----
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State for voice note
  
  const fileInputRef = useRef(null); 
  // --- REMOVED: MediaRecorder refs, we are using SpeechRecognition now ---

  // --- Text Message Sending (Unchanged) ---
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
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages(prev => [...prev, { user: false, text: "Failed to get response.", time: new Date().toLocaleTimeString() }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };

  // --- File Upload Logic (Unchanged) ---
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userMsg = { user: true, text: `File: ${file.name}`, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
      const data = await res.json();
      setMessages(prev => [...prev, { user: false, text: `File "${data.filename}" processed: ${data.analysis}`, time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      console.error("File upload error:", err);
      setMessages(prev => [...prev, { user: false, text: "Failed to process file.", time: new Date().toLocaleTimeString() }]);
    } finally {
      setTyping(false);
    }
    e.target.value = null;
  };
  
  // --- NEW: Voice-to-Text Logic ---
  const handleVoiceRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      // If already recording, stop it
      recognition.stop();
      setIsRecording(false);
    } else {
      // If not recording, start it
      
      // Clear old input
      setInput(""); 

      recognition.start();
      setIsRecording(true);

      // Event: As user speaks, update the input field
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript); // Update input field in real-time
      };

      // Event: When user stops talking
      recognition.onend = () => {
        setIsRecording(false);
      };

      // Event: Handle errors
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  };

  // --- Input Typing Handler (Unchanged) ---
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <Container>
      <Header>
        <HeaderIconButton onClick={() => alert("Menu & History clicked")}>
          &#9776;
        </HeaderIconButton>
        <UpgradeButton onClick={() => alert("Upgrade clicked")}>Upgrade</UpgradeButton>
      </Header>
      
      <ChatBox>
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

        <InputContainer>
          <IconButton onClick={handleAttachmentClick}>+</IconButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          
          <InputWrapper>
            <TextInput
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask ChatGPT"
            />
            {/* --- UPDATED: Mic button now toggles Voice-to-Text --- */}
            <IconButton 
              onClick={handleVoiceRecording}
              isRecording={isRecording}
            >
              🎤
            </IconButton>
          </InputWrapper>
          
          <SendButton onClick={sendMessage} disabled={!input.trim()}>
            ↑
          </SendButton>
        </InputContainer>
      </ChatBox>
    </Container>
  );
}

export default App;
