import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";
import { useChat } from "../../context/ChatContext.jsx";

import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";
import Moment from "moment";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import EmojiPicker from "emoji-picker-react";

function Chat() {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Removed loading
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  const userId = user?.user_id;

  // 1. Fetch Contacts
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isChatSearchVisible, setIsChatSearchVisible] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const displayedMessages = messages.filter((msg) =>
    chatSearchQuery
      ? msg.message.toLowerCase().includes(chatSearchQuery.toLowerCase())
      : true,
  );

  const handleSearch = async (query) => {
    try {
      const res = await apiInstance.get(`user/search/?query=${query}`);
      setSearchResults(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchContacts = useCallback(async () => {
    try {
      const res = await apiInstance.get(`chat/inbox/${userId}/`);
      setContacts(res.data);
      // Return data for chaining
      return res.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [userId]);

  const scrollToBottom = () => {
    // Small timeout to ensure DOM render
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 3. Fetch Messages
  const fetchMessages = useCallback(
    async (contactId) => {
      try {
        const res = await apiInstance.get(`chat/get/${userId}/${contactId}/`);
        setMessages(res.data);
        // Notify header that messages are read
        window.dispatchEvent(new Event("messagesRead"));
        scrollToBottom();
      } catch (error) {
        console.log(error);
      }
    },
    [userId],
  );

  const handleSelectUser = useCallback(
    (contact) => {
      setSelectedUser(contact);
      fetchMessages(contact.user.id);
    },
    [fetchMessages],
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const payload = {
        sender_id: userId,
        receiver_id: selectedUser.user.id,
        message: newMessage,
      };
      const res = await apiInstance.post(`chat/send/`, payload);
      // Optimistic update
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      fetchContacts();
    } catch (error) {
      console.log(error);
    }
  };

  // Initial load logic with optional partnerId from navigation
  useEffect(() => {
    if (!userId) return;

    const initChat = async () => {
      const inbox = await fetchContacts();

      // Check for partnerId from navigation state
      const partnerId = location.state?.partnerId;

      if (partnerId) {
        // Check if partner is already in contacts
        const existingContact = inbox.find(
          (c) => c.partner.user.id === partnerId,
        );

        if (existingContact) {
          handleSelectUser(existingContact.partner);
        } else {
          // Fetch partner profile explicitly if not in inbox
          try {
            const res = await apiInstance.get(`user/profile/${partnerId}/`); // Assuming generic public profile endpoint or similar
            // Wait, we need to adapt the profile structure to match what Chat expects (partner object)
            // The Inbox API returns: { partner: { user: {id, username}, full_name, image... }, latest_message }
            // We need to construct a "partner" object.

            // Actually let's check `apiInstance.get('user/profile/<id>/')` return structure.
            // Usually returns a ProfileSerializer dump.

            const profileData = res.data;
            const newPartner = {
              user: {
                id: profileData.user.id,
                username: profileData.user.username,
              },
              full_name: profileData.full_name,
              image: profileData.image,
            };
            setSelectedUser(newPartner);
            fetchMessages(partnerId);
          } catch (err) {
            console.error("Failed to fetch partner info", err);
          }
        }
        // Clear state so we don't re-select on reload? No, location state persists until navigation.
        window.history.replaceState({}, document.title);
      }
    };

    initChat();
  }, [userId, fetchContacts, location.state, handleSelectUser, fetchMessages]);

  // Note: We removed the simple useEffect([userId]) call because logic is now in initChat

  // Use Global Chat Context
  const { newMessage: incomingMessage, sendSeen } = useChat();

  // Listen for global messages from Context
  useEffect(() => {
    if (incomingMessage) {
      // Update contacts/sidebar list always
      fetchContacts();

      if (selectedUser) {
        const partnerId = selectedUser.user.id;
        // Check relevance
        const isRelated =
          (String(incomingMessage.sender) === String(partnerId) &&
            String(incomingMessage.receiver) === String(userId)) ||
          (String(incomingMessage.sender) === String(userId) &&
            String(incomingMessage.receiver) === String(partnerId)) ||
          (typeof incomingMessage.sender === "object" &&
            String(incomingMessage.sender.id) === String(partnerId));

        if (isRelated) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMessage.id)) return prev;

            // If incoming message is from partner, mark as seen immediately if we are viewing this chat
            if (
              String(incomingMessage.sender) === String(partnerId) ||
              (typeof incomingMessage.sender === "object" &&
                String(incomingMessage.sender.id) === String(partnerId))
            ) {
              if (typeof sendSeen === "function") sendSeen(partnerId);
              window.dispatchEvent(new Event("messagesRead"));
            }

            return [...prev, incomingMessage];
          });
          scrollToBottom();
        }
      }
    }
  }, [incomingMessage, selectedUser, userId, fetchContacts, sendSeen]);

  // Mark seen when selecting user or loading messages
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      // Check if last message is not read and from partner
      const lastMsg = messages[messages.length - 1];
      const senderId =
        typeof lastMsg.sender === "object" ? lastMsg.sender.id : lastMsg.sender;
      if (String(senderId) === String(selectedUser.user.id)) {
        if (typeof sendSeen === "function") {
          sendSeen(selectedUser.user.id);
          window.dispatchEvent(new Event("messagesRead"));
        }
      }
    }
  }, [selectedUser, messages, sendSeen]);

  // 3. Fetch Messages not needed here (duplicate)

  // Handlers not needed here (duplicate)

  // Note: We removed the duplicates that were accidentally re-added below the WebSocket effect.

  return (
    <>
      <Header />
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Sidebar: Contacts */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom-0 py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-comments me-2 text-primary"></i>{" "}
                    {t("chat.messages", "Messages")}
                  </h5>
                  <div className="mt-3">
                    <input
                      type="text"
                      className="form-control rounded-pill border-0 bg-light"
                      placeholder={t("search.startTyping", "Search users...")}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length > 0) {
                          handleSearch(e.target.value);
                        } else {
                          setSearchResults([]);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="card-body p-0">
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "600px", overflowY: "auto" }}
                  >
                    {searchQuery.length > 0 ? (
                      <>
                        {searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                // Construct profile-like object if needed, or if API returns profile
                                const profile = user.profile || {
                                  user: user,
                                  image:
                                    user.image ||
                                    "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1726673863~exp=1726677463~hmac=62153920704944d156540b6e4e5eb3e858db1e72332bb82a893cb99f188339c0&w=740", // Fallback or user.image if serializer has it
                                  full_name: user.full_name || user.username,
                                };
                                // If API returns Profile directly (check serializer later if needed)
                                // Assuming UserSerializer usually returns 'profile' nested or flat fields?
                                // Let's assume the Search API returns Users with fields.
                                // Best effort map:
                                handleSelectUser(profile);
                                setSearchQuery(""); // Clear search on select
                                setSearchResults([]);
                              }}
                              className="list-group-item list-group-item-action p-3 border-0 border-bottom"
                            >
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    user.image ||
                                    user.profile?.image ||
                                    "https://th.bing.com/th/id/OIP.Kg2FF2wpIK_HLnc8Q5UEHAAAAA?rs=1&pid=ImgDetMain"
                                  }
                                  className="rounded-circle object-fit-cover"
                                  style={{ width: "50px", height: "50px" }}
                                  alt={user.username}
                                />
                                <div className="ms-3">
                                  <h6 className="mb-0 fw-bold">
                                    {user.full_name || user.username}
                                  </h6>
                                  <small className="text-muted">
                                    @{user.username}
                                  </small>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-center p-3 text-muted">
                            No user found.
                          </p>
                        )}
                      </>
                    ) : (
                      contacts.map((c) => (
                        <button
                          key={c.partner.user.id}
                          onClick={() => handleSelectUser(c.partner)}
                          className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${selectedUser?.user?.id === c.partner.user.id ? "bg-primary-subtle" : ""}`}
                        >
                          <div className="d-flex align-items-center">
                            <div className="position-relative">
                              <img
                                src={c.partner.image}
                                className="rounded-circle object-fit-cover"
                                style={{ width: "50px", height: "50px" }}
                                alt={c.partner.full_name}
                                onError={(e) => {
                                  e.target.src =
                                    "https://th.bing.com/th/id/OIP.Kg2FF2wpIK_HLnc8Q5UEHAAAAA?rs=1&pid=ImgDetMain";
                                }}
                              />
                              <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle">
                                <span className="visually-hidden">Online</span>
                              </span>
                            </div>
                            <div className="ms-3 flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="mb-0 text-truncate fw-bold">
                                  {c.partner.full_name ||
                                    c.partner.user.username}
                                </h6>
                                <small
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  {Moment(c.latest_message.date).format(
                                    "HH:mm",
                                  )}
                                </small>
                              </div>
                              <p className="mb-0 text-muted small text-truncate">
                                {c.latest_message.sender === userId ? (
                                  <span className="text-primary me-1">
                                    {t("chat.you", "You")}:
                                  </span>
                                ) : null}
                                {c.latest_message.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                    {searchQuery.length === 0 && contacts.length === 0 && (
                      <div className="text-center p-5 text-muted">
                        <i className="far fa-comment-dots fa-3x mb-3"></i>
                        <p>{t("chat.noContacts", "No conversations yet.")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="col-lg-8">
              {selectedUser ? (
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ minHeight: "600px" }}
                >
                  {/* Chat Header */}
                  <div className="card-header bg-white border-bottom py-3 sticky-top">
                    {isChatSearchVisible ? (
                      <div className="d-flex align-items-center">
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <i className="fas fa-search text-muted"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light shadow-none"
                            placeholder={t(
                              "chat.searchInChat",
                              "Search in conversation...",
                            )}
                            value={chatSearchQuery}
                            onChange={(e) => setChatSearchQuery(e.target.value)}
                            autoFocus
                          />
                          <button
                            className="btn btn-light text-muted"
                            onClick={() => {
                              setIsChatSearchVisible(false);
                              setChatSearchQuery("");
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <img
                            src={selectedUser.image}
                            className="rounded-circle object-fit-cover"
                            style={{ width: "45px", height: "45px" }}
                            alt={selectedUser.full_name}
                          />
                          <div className="ms-3">
                            <h6 className="mb-0 fw-bold">
                              {selectedUser.full_name ||
                                selectedUser.user.username}
                            </h6>
                            <small className="text-success">
                              <i className="fas fa-circle fa-xs me-1"></i>{" "}
                              Online
                            </small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/profile/${selectedUser.user.id}/`}
                            className="btn btn-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "36px", height: "36px" }}
                            title={t("chat.viewProfile", "View Profile")}
                          >
                            <i className="fas fa-user"></i>
                          </Link>

                          <div className="dropdown">
                            <button
                              className="btn btn-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "36px", height: "36px" }}
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => setIsChatSearchVisible(true)}
                                >
                                  <i className="fas fa-search me-2 text-muted"></i>
                                  {t("chat.search", "Search")}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    fetchMessages(selectedUser.user.id)
                                  }
                                >
                                  <i className="fas fa-sync-alt me-2 text-muted"></i>
                                  {t("chat.refresh", "Refresh")}
                                </button>
                              </li>
                              <li>
                                <hr className="dropdown-divider" />
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => {
                                    // Mock block/delete
                                    Swal.fire({
                                      title: t(
                                        "chat.deleteConfirmTitle",
                                        "Delete Conversation?",
                                      ),
                                      text: t(
                                        "chat.deleteConfirmText",
                                        "Action coming soon!",
                                      ),
                                      icon: "info",
                                    });
                                  }}
                                >
                                  <i className="fas fa-trash-alt me-2"></i>
                                  {t("chat.delete", "Delete Chat")}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Chat Body */}
                  <div
                    className="card-body p-4 bg-light d-flex flex-column"
                    style={{ height: "500px", overflowY: "auto" }}
                  >
                    {displayedMessages.map((msg, index) => {
                      // Handle potential type mismatches or object presence
                      const senderId =
                        typeof msg.sender === "object"
                          ? msg.sender.id
                          : msg.sender;
                      const currentUserId = user?.user_id;
                      const isMe = String(senderId) === String(currentUserId);

                      return (
                        <div
                          key={index}
                          className={`d-flex mb-4 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.sender_profile.image}
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                              alt="sender" // Removed align-self-end, default is stretch, but d-flex aligns items stretch.
                              // We want it at the top? or center? Usually top for long text, bottom for short.
                              // Let's us align-self-start (top) for consistency or add a wrapper.
                              // Actually, standard is bottom (align-self-end).
                            />
                          )}
                          <div
                            className={`p-3 shadow-sm ${isMe ? "bg-primary text-white rounded-top-right-0" : "bg-body-secondary text-body rounded-top-left-0"}`}
                            style={{
                              maxWidth: "75%",
                              borderRadius: "20px",
                              borderTopRightRadius: isMe ? "5px" : "20px",
                              borderTopLeftRadius: !isMe ? "5px" : "20px",
                            }}
                          >
                            <div className="mb-1">
                              {msg.file && (
                                <div className="mb-2">
                                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(
                                    msg.file,
                                  ) ? (
                                    <img
                                      src={msg.file}
                                      alt="attachment"
                                      className="img-fluid rounded"
                                      style={{
                                        maxWidth: "200px",
                                        maxHeight: "200px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : /\.(webm|mp3|wav|ogg)$/i.test(
                                      msg.file,
                                    ) ? (
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
                                      {t("chat.attachment", "Attachment")}
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.message && (
                                <p
                                  className="mb-0"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.message}
                                </p>
                              )}
                            </div>
                            <div
                              className={`small d-flex align-items-center justify-content-end ${isMe ? "text-white-50" : "text-muted"}`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {Moment(msg.date).format("HH:mm")}
                              {isMe && (
                                <i
                                  className={`fas fa-check-double ms-1 ${msg.is_read ? "text-info" : ""}`}
                                ></i>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Chat Input */}
                  <div className="card-footer bg-white border-top p-3">
                    {/* File Preview */}
                    {selectedFile && (
                      <div className="mb-2 d-flex align-items-center bg-light p-2 rounded">
                        <span className="me-2 text-primary">
                          <i className="fas fa-file"></i>
                        </span>
                        <span
                          className="small text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {selectedFile.name}
                        </span>
                        <button
                          type="button"
                          className="btn-close ms-auto small"
                          onClick={() => setSelectedFile(null)}
                        ></button>
                      </div>
                    )}
                    <form
                      onSubmit={handleSendMessage}
                      className="d-flex align-items-center"
                    >
                      <input
                        type="file"
                        className="d-none"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary rounded-circle me-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="fas fa-paperclip"></i>
                      </button>

                      <div className="flex-grow-1 position-relative">
                        <input
                          type="text"
                          className="form-control rounded-pill border-0 bg-light py-2 px-4 shadow-none"
                          placeholder={t(
                            "chat.typeMessage",
                            "Type a message...",
                          )}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          style={{ paddingRight: "40px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 text-decoration-none"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <i className="far fa-smile"></i>
                        </button>

                        {showEmojiPicker && (
                          <div className="position-absolute bottom-100 end-0 mb-3 shadow-lg z-3">
                            <EmojiPicker
                              onEmojiClick={(emojiObject) =>
                                setNewMessage(
                                  (prev) => prev + emojiObject.emoji,
                                )
                              }
                              width={300}
                              height={400}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary rounded-circle ms-2 shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: "45px", height: "45px" }}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center text-center p-5">
                  <div className="py-5">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-4">
                      <i className="fas fa-comments fa-4x text-primary"></i>
                    </div>
                    <h3>{t("chat.welcome", "Welcome to Messages")}</h3>
                    <p className="text-muted max-w-sm mx-auto">
                      {t(
                        "chat.selectContact",
                        "Select a conversation from the sidebar to all start chatting.",
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Chat;
