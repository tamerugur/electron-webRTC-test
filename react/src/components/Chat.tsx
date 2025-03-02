import { useState, useCallback, useRef, useEffect } from "react";
import { Socket } from "phoenix";

// project imports
import sendIcon from "../assets/sendIcon.svg";

interface voiceChatProps {
  chatHeight: string;
  chatWidth: string;
}

interface Message {
  text: string;
  timestamp: number;
  sender: string;
}

declare global {
  interface Window {
    chatAPI: {
      saveChatLog: (messages: Message[]) => Promise<boolean>;
      loadChatLog: () => Promise<Message[]>;
    };
  }
}

function Chat(props: voiceChatProps) {
  console.log("Chat component loaded");
  const [channel, setChannel] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = new Socket("ws://localhost:4000/socket");
    socket.connect();

    const channel = socket.channel("room:lobby", {});
    channel
      .join()
      .receive("ok", () => console.log("Connected to WebSocket!"))
      .receive("error", (err) => console.error("Connection error:", err));

    channel.on("signal", (payload) => {
      console.log("Received signal:", payload);
    });

    setChannel(channel);

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      const savedMessages = await window.chatAPI.loadChatLog();
      setMessages(savedMessages);
    };
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      window.chatAPI.saveChatLog(messages);
    }
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  };

  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentMessage = messages[index];
    return currentMessage.timestamp - prevMessage.timestamp > 60000;
  };

  const sendMessage = useCallback(() => {
    if (inputRef.current && channel && inputRef.current.value.trim()) {
      const newMessage = {
        text: inputRef.current.value,
        timestamp: Date.now(),
        sender: "User",
      };
      channel.push("signal", { message: newMessage.text });
      setMessages((prev) => [...prev, newMessage]);
      inputRef.current.value = "";
    }
  }, [channel]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div
      style={{
        height: props.chatHeight,
        width: props.chatWidth,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#363940",
      }}
    >
      <div
        ref={messagesEndRef}
        style={{
          flex: 1,
          width: "100%",
          margin: "0",
          overflow: "auto",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <style>
          {`
          ::-webkit-scrollbar-button {
            display: none;
          }

          ::-webkit-scrollbar {
            width: 9px; /* Adjust scrollbar width */
          }

          ::-webkit-scrollbar-track {
            background: #2B2D31;
          }

          ::-webkit-scrollbar-thumb {
            background: #1A1B1E;
            border-radius: 10px;
          }
          }
        `}
        </style>
        {messages.map((msg, index) => (
          <div
            key={msg.timestamp}
            style={{
              display: "flex",
              marginBottom: "4px",
              paddingLeft: "10px",
              alignItems: "baseline",
              fontSize: "18px",
              lineHeight: "1.5",
            }}
          >
            <div
              style={{
                minWidth: "45px",
                color: "#808080",
                fontSize: "12px",
                height: "100%",
                display: "flex",
                alignItems: "baseline",
              }}
            >
              {shouldShowTimestamp(index) ? formatTimestamp(msg.timestamp) : ""}
            </div>
            <div
              style={{
                color: "#4752C4",
                marginRight: "4px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {msg.sender}:
            </div>
            <div
              style={{
                color: "white",
                fontSize: "14px",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          width: "90%",
          position: "relative",
          marginBottom: "10px",
          alignSelf: "center",
        }}
      >
        <input
          type="text"
          ref={inputRef}
          onKeyDown={handleKeyPress}
          style={{
            width: `${props.chatWidth}`,
            padding: "12px",
            paddingRight: "40px",
            borderRadius: "10px",
            border: "1px solid #41444a",
            fontSize: "16px",
            outline: "none",
            height: "25px",
            backgroundColor: "#41444a",
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
          }}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#4752C4",
            border: "none",
            outline: "none",
            cursor: "pointer",
            fontSize: "18px",
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
          }}
        >
          <img
            src={sendIcon}
            alt="Send"
            style={{ width: "20px", height: "20px" }}
          />
        </button>
      </div>
    </div>
  );
}

export default Chat;
