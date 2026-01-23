import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useAuthStore } from "../../store/auth";
import apiInstance from "../../utils/axios";
import "moment/locale/vi";
import Moment from "moment";
import EmojiPicker from "emoji-picker-react";
import { useTranslation } from "react-i18next";

const ChatPopup = ({ chatSession, onImageClick }) => {
  const {
    closeChat,
    minimizeChat,
    newMessage,
    onlineUsers,
    typingUsers,
    readReceipt,
    sendTyping,
    sendSeen,
  } = useChat();
  const { user, isMinimized } = chatSession;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const currentUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { t } = useTranslation();

  // Set moment locale to Vietnamese
  Moment.locale("vi");

  const isOnline = onlineUsers?.has(String(user.id));
  const isTyping = typingUsers?.[user.id];

  // New features state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ... (Initial fetch and effects)

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiInstance.get(
          `chat/get/${currentUser?.user_id}/${user.id}/`,
        );
        setMessages(res.data);
        // Mark as seen immediately if we are fetching
        sendSeen(user.id);
      } catch (error) {
        console.error(error);
      }
    };
    if (!isMinimized && currentUser?.user_id) {
      fetchMessages();
    }
  }, [user.id, currentUser?.user_id, isMinimized, sendSeen]);

  // Mark incoming messages as seen if chat is open
  useEffect(() => {
    if (newMessage && !isMinimized) {
      const senderId =
        typeof newMessage.sender === "object"
          ? newMessage.sender.id
          : newMessage.sender;
      if (String(senderId) === String(user.id)) {
        sendSeen(user.id);
      }
    }
  }, [newMessage, isMinimized, user.id, sendSeen]);

  // Update messages when partner reads them
  useEffect(() => {
    if (readReceipt && String(readReceipt.userId) === String(user.id)) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            String(msg.sender) === String(currentUser?.user_id) ||
            String(msg.sender?.id) === String(currentUser?.user_id)
          ) {
            return { ...msg, is_read: true };
          }
          return msg;
        }),
      );
    }
  }, [readReceipt, user.id, currentUser?.user_id]);

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

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Cannot access microphone. Please allow permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    sendTyping(user.id, true);

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(user.id, false);
    }, 2000);
  };

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
    if (!input.trim() && !selectedFile && !audioBlob) return;

    try {
      const formData = new FormData();
      formData.append("sender_id", currentUser?.user_id);
      formData.append("receiver_id", user.id);
      if (input.trim()) {
        formData.append("message", input);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (audioBlob) {
        formData.append("file", audioBlob, "voice_message.webm");
      }

      const res = await apiInstance.post(`chat/send/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessages((prev) => [...prev, res.data]);
      setInput("");
      setSelectedFile(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setShowEmojiPicker(false);

      // Stop typing immediately
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTyping(user.id, false);
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
                {msg.file && (
                  <div className="mb-2">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file) ? (
                      <img
                        src={msg.file}
                        alt="attachment"
                        className="img-fluid rounded cursor-pointer"
                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                        onClick={() => {
                          onImageClick(msg.file);
                        }}
                      />
                    ) : /\.(webm|mp3|wav|ogg)$/i.test(msg.file) ? (
                      <audio
                        controls
                        src={msg.file}
                        style={{ maxWidth: "100%" }}
                      />
                    ) : (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-decoration-underline ${isMe ? "text-white" : "text-dark"}`}
                      >
                        <i className="fas fa-file me-1"></i>
                        {t("chat.attachment", "File đính kèm")}
                      </a>
                    )}
                  </div>
                )}
                {msg.message}
                <div
                  className={`text-end mt-1 ${isMe ? "text-white-50" : "text-muted"}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {Moment(msg.date).locale("vi").format("HH:mm")}
                  {isMe && (
                    <span className="ms-1">
                      {msg.is_read ? (
                        <i className="fas fa-check-double text-light"></i>
                      ) : (
                        <i className="fas fa-check text-white-50"></i>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="d-flex mb-3 justify-content-start">
            {/* Small avatar for typing */}
            <img
              src={user.image}
              className="rounded-circle me-2 align-self-end mb-1 shadow-sm"
              style={{ width: "24px", height: "24px", objectFit: "cover" }}
            />
            <div
              className="bg-white text-muted rounded-top-left-0 p-2 px-3 shadow-sm"
              style={{ borderRadius: "15px", borderTopLeftRadius: "0" }}
            >
              <small className="fw-bold animate-pulse">
                {t("chat.typing", "Đang soạn tin...")}{" "}
                <i className="fas fa-pen-fancy"></i>
              </small>
            </div>
          </div>
        )}

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

        {/* Audio Preview */}
        {audioUrl && (
          <div className="bg-light p-2 mb-2 rounded d-flex align-items-center gap-2">
            <audio
              controls
              src={audioUrl}
              className="flex-grow-1"
              style={{ height: "30px" }}
            />
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0"
              onClick={cancelRecording}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}

        {/* Recording UI */}
        {isRecording ? (
          <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
            <div className="d-flex align-items-center text-danger animate-pulse">
              <i
                className="fas fa-circle me-2"
                style={{ fontSize: "0.5rem" }}
              ></i>
              <span className="fw-bold">Recording...</span>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle me-2"
                onClick={cancelRecording}
                title="Cancel"
              >
                <i className="fas fa-times"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success rounded-circle"
                onClick={stopRecording}
                title="Finish"
              >
                <i className="fas fa-check"></i>
              </button>
            </div>
          </div>
        ) : (
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
              onChange={handleInputChange}
              style={{ paddingRight: "30px" }}
              disabled={!!audioUrl}
            />

            {input.trim() || selectedFile || audioUrl ? (
              <button
                type="submit"
                className="btn btn-link text-primary p-0 ms-2"
              >
                <i className="fas fa-paper-plane fa-lg"></i>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-link text-muted p-0 ms-2"
                onClick={startRecording}
                title="Record Audio"
              >
                <i className="fas fa-microphone fa-lg"></i>
              </button>
            )}

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
                  searchDisabled={false}
                  searchPlaceholder={t(
                    "chat.searchEmoji",
                    "Tìm kiếm biểu tượng...",
                  )}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default function HSChat() {
  const { activeChats } = useChat();
  const [previewImage, setPreviewImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (activeChats.length === 0) return null;

  return (
    <>
      <div
        className="position-fixed bottom-0 end-0 mb-0 me-4 d-flex align-items-end"
        style={{ zIndex: 1050, pointerEvents: "none" }}
      >
        <div className="d-flex" style={{ pointerEvents: "auto" }}>
          {activeChats.map((session) => (
            <ChatPopup
              key={session.user.id}
              chatSession={session}
              onImageClick={(img) => {
                setPreviewImage(img);
                setZoom(1);
                setRotation(0);
              }}
            />
          ))}
        </div>
      </div>

      {/* Global Image Preview Modal */}
      {previewImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="position-relative d-flex align-items-center justify-content-center flex-grow-1 w-100"
            style={{ overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="img-fluid"
              style={{
                maxHeight: "90vh",
                maxWidth: "90vw",
                objectFit: "contain",
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
                cursor: zoom > 1 ? "grab" : "default",
              }}
              draggable={false}
            />
            <button
              className="position-absolute top-0 end-0 btn btn-link text-white m-3"
              style={{ zIndex: 2010 }}
              onClick={() => setPreviewImage(null)}
            >
              <i className="fas fa-times fa-2x"></i>
            </button>
          </div>

          {/* Zoom Controls */}
          <div
            className="d-flex align-items-center gap-3 mb-4 rounded-pill px-3 py-2"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", zIndex: 2010 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-link text-white"
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
              title="Zoom Out"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="text-white small fw-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="btn btn-sm btn-link text-white"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
              title="Zoom In"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button
              className="btn btn-sm btn-link text-white"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
              title="Zoom In"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button
              className="btn btn-sm btn-link text-white ms-2"
              onClick={() => setRotation((prev) => prev + 90)}
              title="Rotate"
            >
              <i className="fas fa-redo"></i>
            </button>
            <button
              className="btn btn-sm btn-link text-white"
              onClick={() => {
                setZoom(1);
                setRotation(0);
              }}
              title="Reset View"
            >
              <i className="fas fa-compress"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
