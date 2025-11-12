import React, { useState, useRef, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import styled, { keyframes, css } from "styled-components";
import ReactMarkdown from 'react-markdown'; // <-- IMPORT THIS

// --- Speech Recognition Setup ---
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false; 
  recognition.lang = "en-US";
  recognition.interimResults = true;
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
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #222; 
  position: relative;
`;

// --- UPDATED: This is just a non-clickable title now ---
const HeaderTitle = styled.div`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => (props.isRecording ? '#ff4136' : '#888')};
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
  position: absolute;
  left: 15px;
`;

// --- NEW: History Panel & Overlay ---
const HistoryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: ${props => (props.show ? 1 : 0)};
  visibility: ${props => (props.show ? "visible" : "hidden")};
  transition: opacity 0.3s ease;
`;

const HistoryPanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: #111;
  border-right: 1px solid #333;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 15px;
  transform: ${props => (props.show ? "translateX(0)" : "translateX(-100%)")};
  transition: transform 0.3s ease-out;
`;

const NewChatButton = styled.button`
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;

  &:hover {
    background: #444;
  }
`;

const HistoryTitle = styled.h3`
  font-size: 14px;
  color: #888;
  margin-bottom: 10px;
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  // This is where you would map over real chat sessions
`;

const HistoryItem = styled.div`
  padding: 8px;
  color: #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: #222;
  }
`;
// --- End of History Panel ---


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

// --- UPDATED: Message component now styles Markdown ---
const Message = styled.div`
  align-self: ${props => (props.user ? "flex-end" : "flex-start")};
  background: ${props => (props.user ? "#333" : "linear-gradient(135deg, #0052D4 0%, #00307A 100%)")};
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

  /* --- NEW: Styling for markdown elements --- */
  p {
    margin: 0;
  }
  strong, b {
    font-weight: 600;
  }
  ul, ol {
    padding-left: 25px;
    margin: 8px 0;
  }
  li {
    margin-bottom: 4px;
  }
  pre {
    background: #000;
    border-radius: 8px;
    padding: 12px;
    font-family: 'Courier New', Courier, monospace;
    overflow-x: auto;
  }
  code {
    background: rgba(0,0,0,0.3);
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
  }
  pre code {
    background: transparent;
    padding: 0;
  }
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

// ----- Main App -----
function App() {
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
  const [showHistory, setShowHistory] = useState(false); // <-- NEW: State for history panel
  const fileInputRef = useRef(null);

  useEffect(() => {
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
      
      // --- Example of AI response with Markdown ---
      // const botText = `Here's a list:\n\n* Item 1\n* Item 2\n\nAnd some **bold** text.`;
      // const botMsg = { user: false, text: botText, time: new Date().toLocaleTimeString() };
      
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
      recognition.onend = () => { setIsRecording(false); };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // --- UPDATED: Reset function now also closes the panel ---
  const handleNewChat = () => {
    if (window.confirm("Are you sure you want to start a new chat? Your current history will be cleared.")) {
      setMessages([]);
      localStorage.removeItem("chatHistory");
      setShowHistory(false); // Close panel after starting new chat
    }
  };

  // --- NOTE ---
  // The HistoryList is a placeholder. A real multi-chat
  // history requires a more complex state and localStorage
  // structure (e.g., an object of chat sessions).
  // This code gives you the UI and the "New Chat" button.

  return (
    <Container>
      {/* --- NEW: History Panel and Overlay --- */}
      <HistoryOverlay show={showHistory} onClick={() => setShowHistory(false)} />
      <HistoryPanel show={showHistory}>
        <NewChatButton onClick={handleNewChat}>
          + New Chat
        </NewChatButton>
        <HistoryTitle>Your Past Chats</HistoryTitle>
        <HistoryList>
          {/* This is where you would map your chat history */}
          <HistoryItem>Placeholder: Chat about code</HistoryItem>
          <HistoryItem>Placeholder: My travel plans</HistoryItem>
        </HistoryList>
      </HistoryPanel>
      
      <Header>
        {/* --- UPDATED: 3-line button now opens history --- */}
        <HeaderIconButton onClick={() => setShowHistory(true)}>
          &#9776;
        </HeaderIconButton>
        
        <HeaderTitle>
          Xzavior
        </HeaderTitle>
      </Header>
      
      <ChatBox>
        {messages.length === 0 && !typing ? (
          <EmptyChatContainer>
            What can I help with?
          </EmptyChatContainer> // <-- THIS WAS THE FIX
        ) : (
          <MessagesContainer>
            {messages.map((msg, i) => (
              <Message key={i} user={msg.user}>
                {/* --- UPDATED: Using ReactMarkdown to render text --- */}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                <Timestamp>{msg.time}</Timestamp>
              </Message>
            ))}
            {typing && (
              <Message user={false}>
                Xzavior AI is typing...
              </Message>
            )}
          </MessagesContainer>
        )}

        <InputContainer>
          {/* ... (rest of the input controls are unchanged) ... */}
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
              placeholder="Ask Xzavior AI"
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
