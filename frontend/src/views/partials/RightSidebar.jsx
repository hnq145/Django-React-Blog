import React, { useState } from "react";
import { useChat } from "../../context/ChatContext.jsx";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const RightSidebar = () => {
  const { contacts, openChat, onlineUsers } = useChat();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (!contacts) return null;

  const filteredContacts = contacts.filter((c) => {
    const name = c.partner.full_name || c.partner.user.username;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      {/* Toggle Button (Floating Action Button) */}
      <button
        className="btn btn-primary rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
        style={{
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          zIndex: 1040,
          transition: "transform 0.2s",
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={t("sidebar.contacts", "Danh bạ")}
      >
        <i
          className={`fas ${isOpen ? "fa-times" : "fa-comment-alt"} fa-lg`}
        ></i>
      </button>

      {/* Floating Contact List Panel */}
      <div
        className={`card border-0 shadow-lg position-fixed bg-white ${isOpen ? "d-flex" : "d-none"}`}
        style={{
          bottom: "90px",
          right: "20px",
          width: "300px",
          maxHeight: "70vh",
          borderRadius: "15px",
          zIndex: 1040,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="card-header bg-primary text-white py-3">
          <h6 className="mb-0 fw-bold">
            <i className="fas fa-address-book me-2"></i>
            {t("sidebar.contacts", "Danh bạ")}
          </h6>
        </div>

        {/* Search */}
        <div className="p-2 border-bottom">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-0">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 shadow-none"
              placeholder={t("sidebar.search", "Tìm kiếm người dùng...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div
          className="card-body p-0 overflow-y-auto custom-scrollbar"
          style={{ minHeight: "200px" }}
        >
          {filteredContacts.length === 0 ? (
            <div className="text-center text-muted py-4">
              <small>{t("sidebar.no_contacts", "Không tìm thấy ai")}</small>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {filteredContacts.map((c, index) => {
                const user = c.partner;
                const chatUser = {
                  id: user.user.id,
                  username: user.user.username,
                  full_name: user.full_name,
                  image: user.image,
                };
                const isOnline = onlineUsers?.has(String(user.user.id));

                return (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action border-0 px-3 py-2 cursor-pointer"
                    onClick={() => {
                      openChat(chatUser);
                      if (window.innerWidth < 768) setIsOpen(false); // Close on mobile
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="position-relative">
                        <img
                          src={user.image}
                          alt={user.full_name}
                          className="rounded-circle object-fit-cover shadow-sm bg-light"
                          style={{ width: "40px", height: "40px" }}
                        />
                        {isOnline && (
                          <span className="position-absolute bottom-0 end-0 bg-success p-1 rounded-circle border border-white"></span>
                        )}
                      </div>
                      <div className="ms-3 flex-grow-1 overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className="fw-semibold text-dark text-truncate"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {user.full_name || user.user?.username}
                          </span>
                          {/* Unread badge concept if implemented later */}
                        </div>
                        <small
                          className="text-muted d-block text-truncate"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {isOnline ? (
                            <span className="text-success">
                              {t("status.online", "Đang hoạt động")}
                            </span>
                          ) : (
                            t("status.offline", "Ngoại tuyến")
                          )}
                        </small>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0; 
            border-radius: 10px;
        }
        .cursor-pointer {
            cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default RightSidebar;
