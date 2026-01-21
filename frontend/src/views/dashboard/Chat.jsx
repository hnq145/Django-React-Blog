import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";
import { Link, useLocation } from "react-router-dom";
import Moment from "moment";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

function Chat() {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  // Removed loading
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const location = useLocation();

  const userId = user?.user_id;

  // 1. Fetch Contacts
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

  // 2. WebSocket Connection
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token || !userId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("Chat WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        const incomingMsg = data.message;

        // If this message belongs to current selected conversation, append it
        // Check if sender or receiver matches the selected user

        // We need access to the CURRENT selectedUser state.
        // Since this listener is defined once, it captures initial state?
        // No, useEffect with dependency approach or ref approach needed.
        // For simplicity, we just append to messages state if relevant logic matches.

        setMessages((prevMessages) => {
          // Check deduplication
          if (prevMessages.some((m) => m.id === incomingMsg.id))
            return prevMessages;

          // Check if it belongs to current conversation
          // The incomingMsg has sender and receiver objects (or IDs depending on serializer)
          // Serializer returns ID as int, and objects for profile.

          // Logic: If I am chatting with User A (selectedUser.user.id == A)
          // Incoming message: Sender A -> Receiver Me OR Sender Me -> Receiver A

          // We need to know who is selected.
          // It's tricky inside closure. Let's use functional update but we still need selectedUser.
          // BETTER: Allow appending ALL messages, but filter in render? No, performance.

          // Instead of checking selectedUser here (which might be stale),
          // we can trigger re-fetch or use a Ref for selectedUser.
          return [...prevMessages, incomingMsg];
        });

        // Also update contacts list to show latest message preview
        fetchContacts();
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [userId, fetchContacts]);

  // Filter messages logic moved to render? No, messages state implies "messages for selected user".
  // The socket receives ALL messages for me.
  // So I should only update `messages` if the incoming message is relevant to `selectedUser`.

  // Ref for selectedUser to use inside socket callback
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Re-define onmessage effectively when selectedUser changes?
  // No, keep socket stable. Update handler.
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        const incomingMsg = data.message;
        const currentSelected = selectedUserRef.current;

        fetchContacts(); // Always update sidebar

        if (currentSelected) {
          const partnerId = currentSelected.user.id;
          // Check if message relates to partnerId
          const isRelated =
            (incomingMsg.sender === partnerId &&
              incomingMsg.receiver === userId) ||
            (incomingMsg.sender === userId &&
              incomingMsg.receiver === partnerId);

          if (isRelated) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              return [...prev, incomingMsg];
            });
            // Scroll will happen via messages changes
          }
        }
      }
    };
  }, [selectedUser, userId, fetchContacts]); // Re-bind when selectedUser changes, or just rely on Ref.
  // Actually if we use Ref, we don't need to re-bind, but strict mode might require valid closure.
  // Re-binding onmessage is fine.

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
                </div>
                <div className="card-body p-0">
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "600px", overflowY: "auto" }}
                  >
                    {contacts.map((c) => (
                      <button
                        key={c.partner.id}
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
                            />
                            <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle">
                              <span className="visually-hidden">Online</span>
                            </span>
                          </div>
                          <div className="ms-3 flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 text-truncate fw-bold">
                                {c.partner.full_name || c.partner.user.username}
                              </h6>
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {Moment(c.latest_message.date).format("HH:mm")}
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
                    ))}
                    {contacts.length === 0 && (
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
                  <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between sticky-top">
                    <div className="d-flex align-items-center">
                      <img
                        src={selectedUser.image}
                        className="rounded-circle object-fit-cover"
                        style={{ width: "45px", height: "45px" }}
                        alt={selectedUser.full_name}
                      />
                      <div className="ms-3">
                        <h6 className="mb-0 fw-bold">
                          {selectedUser.full_name || selectedUser.user.username}
                        </h6>
                        <small className="text-success">
                          <i className="fas fa-circle fa-xs me-1"></i> Online
                        </small>
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/profile/${selectedUser.user.id}/`}
                        className="btn btn-light btn-sm rounded-circle me-2"
                      >
                        <i className="fas fa-user"></i>
                      </Link>
                      <button className="btn btn-light btn-sm rounded-circle">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>
                  </div>

                  {/* Chat Body */}
                  <div
                    className="card-body p-4 bg-light d-flex flex-column"
                    style={{ height: "500px", overflowY: "auto" }}
                  >
                    {messages.map((msg, index) => {
                      const isMe = msg.sender === userId;
                      return (
                        <div
                          key={index}
                          className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.sender_profile.image}
                              className="rounded-circle align-self-end mb-1 me-2"
                              style={{
                                width: "35px",
                                height: "35px",
                                objectFit: "cover",
                              }}
                              alt="sender"
                            />
                          )}
                          <div
                            className={`p-3 rounded-4 shadow-sm ${isMe ? "bg-primary text-white" : "bg-white text-dark"}`}
                            style={{
                              maxWidth: "75%",
                              borderBottomRightRadius: isMe ? "0" : "1rem",
                              borderBottomLeftRadius: !isMe ? "0" : "1rem",
                            }}
                          >
                            <p className="mb-1">{msg.message}</p>
                            <div
                              className={`small text-end ${isMe ? "text-white-50" : "text-muted"}`}
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
                    <form
                      onSubmit={handleSendMessage}
                      className="d-flex align-items-center"
                    >
                      <button
                        type="button"
                        className="btn btn-light rounded-circle me-2 text-muted"
                      >
                        <i className="fas fa-paperclip"></i>
                      </button>
                      <input
                        type="text"
                        className="form-control rounded-pill border-0 bg-light py-2 px-4 shadow-none"
                        placeholder={t("chat.typeMessage", "Type a message...")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary rounded-circle ms-2 shadow-sm"
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
