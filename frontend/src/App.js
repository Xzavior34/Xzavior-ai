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

// --- UPDATED: Renamed button ---
const XzaviorButton = styled.button`
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

const MessagesContainer = styled(ScrollToBottom)`
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
`;

// --- NO CHANGE NEEDED: This logic is already correct ---
// User (true) aligns left (flex-start)
// AI (false) aligns right (flex-end)
const Message = styled.div`
  align-self: ${props => (props.user ? "flex-start" : "flex-end")};
  background-color: ${props => (props.user ? "#333" : "#1abc9c")};
  color: #fff;
  padding: 14px 20px;
  border-radius: 20px;
  max-width: 75%;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
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
  // --- UPDATED: Load messages from localStorage on startup ---
  const [messages, setMessages] = useState(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    try {
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to parse chat history:", e);
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);

  // --- NEW: Save messages to localStorage whenever they change ---
  useEffect(() => {
    // Don't save empty array if it's just initializing
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);


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
  
  const handleVoiceRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setInput(""); 
      recognition.start();
      setIsRecording(true);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // --- NEW: Function for the menu button to clear chat history ---
  const handleNewChat = () => {
    if (window.confirm("Are you sure you want to start a new chat? Your current history will be cleared.")) {
      setMessages([]);
      localStorage.removeItem("chatHistory");
    }
  };

  return (
    <Container>
      <Header>
        {/* --- UPDATED: onClick handler --- */}
        <HeaderIconButton onClick={handleNewChat}>
          &#9776;
        </HeaderIconButton>
        {/* --- UPDATED: Button text --- */}
        <XzaviorButton>Xzavior</XzaviorButton>
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
              placeholder="Ask Xzavior AI" // Also updated placeholder
            />
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
