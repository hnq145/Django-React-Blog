import React, { useState, useRef, useEffect } from "react";
import { useAIService } from "../../utils/useAIService";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MdContentCopy } from "react-icons/md";

const AIChatAssistant = ({ contextString, imageContext }) => {
  const { isLoading, generateContent } = useAIService();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const { t, i18n } = useTranslation();

  const tSafe = (key, valVi, valEn) => {
    const tVal = t(key);
    if (tVal !== key) return tVal;
    return i18n.language === "vi" ? valVi : valEn;
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = { role: "user", type: "text", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const type =
        prompt.toLowerCase().includes("tạo ảnh") ||
        prompt.toLowerCase().includes("tạo hình") ||
        prompt.toLowerCase().includes("vẽ")
          ? "image"
          : "text";

      const aiResult = await generateContent(
        prompt,
        type,
        contextString,
        imageContext
      );

      const content =
        aiResult.type === "image"
          ? `data:image/jpeg;base64,${aiResult.content}`
          : aiResult.content;

      setMessages((prev) => [
        ...prev,
        { role: "ai", type: aiResult.type, content: content },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", type: "error", content: `Lỗi: ${err.message}` },
      ]);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const LoadingDots = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div
        className="dot"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: "#6B7280",
          borderRadius: "50%",
          animation: "pulse 1.5s infinite ease-in-out",
          animationDelay: "0s",
        }}
      ></div>
      <div
        className="dot"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: "#6B7280",
          borderRadius: "50%",
          animation: "pulse 1.5s infinite ease-in-out",
          animationDelay: "0.2s",
        }}
      ></div>
      <div
        className="dot"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: "#6B7280",
          borderRadius: "50%",
          animation: "pulse 1.5s infinite ease-in-out",
          animationDelay: "0.4s",
        }}
      ></div>
      <style>
        {`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                `}
      </style>
    </div>
  );

  return (
    <div
      className="ai-chat-container"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: "100%",
        maxHeight: "100%",
      }}
    >
      {/* CHAT BODY */}
      <div
        className="ai-chat-body"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              width: "100%",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className={
                msg.role === "user"
                  ? "ai-chat-message-user"
                  : "ai-chat-message-ai"
              }
              style={{
                width: "auto",
                minWidth: "30%",
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: "18px",
                fontSize: "15px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {msg.type === "image" ? (
                <img
                  src={msg.content}
                  alt="AI Generated Image"
                  style={{
                    borderRadius: "8px",
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/200x200/cccccc/333333?text=Image+Load+Error";
                  }}
                />
              ) : (
                <>
                  {msg.role === "ai" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "4px",
                      }}
                    >
                      <button
                        className="ai-chat-copy-btn"
                        onClick={() => handleCopy(msg.content)}
                        title="Copy"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                        }}
                      >
                        <MdContentCopy size={16} />
                      </button>
                    </div>
                  )}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              className="ai-chat-message-ai"
              style={{
                padding: "10px 16px",
                borderRadius: "18px",
                borderBottomLeftRadius: "4px",
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <LoadingDots />
              {tSafe(
                "detail.aiAnswering",
                "AI đang trả lời...",
                "AI is answering..."
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT */}
      <div
        className="ai-chat-footer"
        style={{
          padding: "12px",
          flexShrink: 0,
        }}
      >
        {/* Verification Indicator */}
        {imageContext && (
          <div
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <i className="fas fa-eye text-primary"></i>
            <span>
              {tSafe(
                "ai.imageContext",
                "AI đang xem hình ảnh bạn chọn",
                "AI is viewing your selected image"
              )}
            </span>
          </div>
        )}

        <div
          className="ai-chat-input-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            borderRadius: "500px",
            padding: "6px 6px 6px 16px",
            boxSizing: "border-box",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <input
            type="text"
            className="ai-chat-input"
            value={prompt}
            // ... rest matches original

            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit(e);
            }}
            placeholder={tSafe(
              "detail.enterQuestion",
              "Hỏi AI bất cứ điều gì...",
              "Ask AI anything..."
            )}
            disabled={isLoading}
            style={{
              flex: 1,
              width: "100%",
              height: "50px",
              border: "5px solid transparent !important",
              outline: "none !important",
              boxShadow: "none !important",
              background: "transparent",
              fontSize: "15px",
              margin: 0,
              padding: 0,
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              marginLeft: "8px",
              border: "none",
              borderRadius: "50%",

              background: prompt.trim() && !isLoading ? "#2563EB" : "#E5E7EB",
              color: prompt.trim() && !isLoading ? "white" : "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: prompt.trim() && !isLoading ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 15L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
