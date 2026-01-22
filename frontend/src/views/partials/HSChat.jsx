import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useAuthStore } from "../../store/auth";
import apiInstance from "../../utils/axios";
import "moment/locale/vi";
import Moment from "moment";
import EmojiPicker from "emoji-picker-react";
import { useTranslation } from "react-i18next";

const ChatPopup = ({ chatSession }) => {
  const { closeChat, minimizeChat, newMessage, onlineUsers } = useChat();
  const { user, isMinimized } = chatSession;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const currentUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  // Set moment locale to Vietnamese
  Moment.locale("vi");

  const isOnline = onlineUsers.has(String(user.id));

  // New features state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiInstance.get(
          `chat/get/${currentUser?.user_id}/${user.id}/`,
        );
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!isMinimized && currentUser?.user_id) {
      fetchMessages();
    }
  }, [user.id, currentUser?.user_id, isMinimized]);

  // Listen for new global messages
  useEffect(() => {
    if (newMessage) {
      // Check if message belongs to this conversation
      const senderId =
        typeof newMessage.sender === "object"
          ? newMessage.sender.id
          : newMessage.sender;
      const receiverId =
        typeof newMessage.receiver === "object"
          ? newMessage.receiver.id
          : newMessage.receiver;

      const isRelevant =
        (String(senderId) === String(user.id) &&
          String(receiverId) === String(currentUser?.user_id)) ||
        (String(senderId) === String(currentUser?.user_id) &&
          String(receiverId) === String(user.id));

      if (isRelevant) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    }
  }, [newMessage, user.id, currentUser?.user_id]);

  // Scroll to bottom
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    // Mimic the main chat sending logic if file is present
    try {
      const payload = {
        sender_id: currentUser?.user_id,
        receiver_id: user.id,
        message: input,
      };

      const res = await apiInstance.post(`chat/send/`, payload);
      setMessages((prev) => [...prev, res.data]);
      setInput("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (isMinimized) {
    return (
      <div
        className="position-relative me-3"
        style={{ width: "60px", zIndex: 1050 }}
      >
        <div
          className="bg-white rounded-circle shadow border d-flex align-items-center justify-content-center cursor-pointer position-relative"
          style={{ width: "50px", height: "50px" }}
          onClick={() => minimizeChat(user.id)}
        >
          <img
            src={user.image}
            className="rounded-circle object-fit-cover"
            style={{ width: "100%", height: "100%" }}
            alt={user.full_name}
          />
          <div className="position-absolute top-0 end-0 bg-success border border-white rounded-circle p-1"></div>
        </div>
        <button
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border-0"
          onClick={() => closeChat(user.id)}
          style={{ cursor: "pointer" }}
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div
      className="card shadow border-0 me-3 d-flex flex-column"
      style={{ width: "340px", height: "450px", zIndex: 1050 }}
    >
      {/* Header */}
      <div
        className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-2 px-3 clickable"
        onClick={() => minimizeChat(user.id)}
        style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
      >
        <div className="d-flex align-items-center">
          <div className="position-relative me-2">
            <img
              src={user.image}
              className="rounded-circle border border-white"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
              alt="User"
            />
            {isOnline && (
              <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle p-1"></span>
            )}
          </div>
          <div className="d-flex flex-column">
            <span
              className="fw-bold small text-truncate"
              style={{ maxWidth: "150px", lineHeight: "1.2" }}
            >
              {user.full_name || user.username}
            </span>
            <small style={{ fontSize: "0.7rem", opacity: 0.8 }}>
              {isOnline
                ? t("status.active", "Hoạt động")
                : Moment(user.last_seen).locale("vi").fromNow()}
            </small>
          </div>
        </div>
        <div>
          <button
            className="btn btn-sm btn-link text-white p-0 me-2"
            onClick={(e) => {
              e.stopPropagation();
              minimizeChat(user.id);
            }}
          >
            <i className="fas fa-minus"></i>
          </button>
          <button
            className="btn btn-sm btn-link text-white p-0"
            onClick={(e) => {
              e.stopPropagation();
              closeChat(user.id);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="card-body p-3 overflow-auto flex-grow-1 bg-light">
        {messages.length === 0 && (
          <div className="text-center text-muted mt-5">
            <p className="small">
              {t("chat.welcome", { name: user.full_name || user.username })}!
            </p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe =
            String(msg.sender) === String(currentUser?.user_id) ||
            String(msg.sender?.id) === String(currentUser?.user_id);
          return (
            <div
              key={idx}
              className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
            >
              {!isMe && (
                <img
                  src={user.image}
                  className="rounded-circle me-2 align-self-end mb-1 shadow-sm"
                  style={{ width: "24px", height: "24px", objectFit: "cover" }}
                />
              )}
              <div
                className={`p-2 px-3 shadow-sm ${isMe ? "bg-primary text-white rounded-top-right-0" : "bg-white text-dark rounded-top-left-0"}`}
                style={{
                  maxWidth: "75%",
                  wordBreak: "break-word",
                  borderRadius: "15px",
                  borderTopRightRadius: isMe ? "0" : "15px",
                  borderTopLeftRadius: !isMe ? "0" : "15px",
                }}
              >
                {msg.message}
                <div
                  className={`text-end mt-1 ${isMe ? "text-white-50" : "text-muted"}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {Moment(msg.date).locale("vi").format("HH:mm")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="card-footer p-2 bg-white border-top">
        {/* File Preview */}
        {selectedFile && (
          <div className="bg-light p-2 mb-2 rounded d-flex justify-content-between align-items-center">
            <span className="small text-truncate" style={{ maxWidth: "200px" }}>
              {selectedFile.name}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0"
              onClick={() => setSelectedFile(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="d-flex align-items-center position-relative"
        >
          {/* Emoji Button */}
          <button
            type="button"
            className="btn btn-link text-muted p-0 me-2"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="far fa-smile fa-lg"></i>
          </button>

          {/* File input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            className="btn btn-link text-muted p-0 me-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-paperclip fa-lg"></i>
          </button>

          <input
            type="text"
            className="form-control form-control-sm rounded-pill border-light bg-light shadow-none"
            placeholder={t("chat.typeMessage")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ paddingRight: "30px" }}
          />

          <button type="submit" className="btn btn-link text-primary p-0 ms-2">
            <i className="fas fa-paper-plane fa-lg"></i>
          </button>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div
              className="position-absolute bottom-100 start-0 mb-2 shadow-lg rounded"
              style={{ zIndex: 1100 }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                height={300}
                width={280}
                searchDisabled={true}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default function HSChat() {
  const { activeChats } = useChat();

  if (activeChats.length === 0) return null;

  return (
    <div
      className="position-fixed bottom-0 end-0 mb-0 me-4 d-flex align-items-end"
      style={{ zIndex: 1050, pointerEvents: "none" }}
    >
      <div className="d-flex" style={{ pointerEvents: "auto" }}>
        {activeChats.map((session) => (
          <ChatPopup key={session.user.id} chatSession={session} />
        ))}
      </div>
    </div>
  );
}
