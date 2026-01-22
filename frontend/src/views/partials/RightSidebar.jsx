import React from "react";
import { useChat } from "../../context/ChatContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RightSidebar = () => {
  const { contacts, openChat, onlineUsers } = useChat();
  const { t } = useTranslation();

  // Filter out contacts? Or show all conversations?
  // Usually right sidebar shows "Friends" or "Recent Contacts".
  // We'll show conversations found in inbox.

  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div
      className="d-none d-xxl-block position-fixed end-0 top-0 h-100 bg-transparent py-5 pe-3"
      style={{
        width: "280px",
        paddingTop: "80px", // Below header
        zIndex: 100,
        marginTop: "60px",
      }}
    >
      <div className="h-100 overflow-y-auto custom-scrollbar">
        <h6 className="text-secondary fw-bold px-2 mb-3">
          {t("sidebar.contacts", "Danh bạ")}
        </h6>
        <ul className="list-unstyled">
          {contacts.map((c, index) => {
            const user = c.partner;
            // Normalize user object for chat consistency (use User ID as 'id')
            const chatUser = {
              id: user.user.id,
              username: user.user.username,
              full_name: user.full_name,
              image: user.image,
            };
            const isOnline = onlineUsers?.has(String(user.user.id));

            return (
              <li key={index} className="mb-1">
                <div
                  className="d-flex align-items-center p-2 rounded-3 hover-bg-light cursor-pointer"
                  onClick={() => openChat(chatUser)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="position-relative">
                    <img
                      src={user.image}
                      alt={user.full_name}
                      className="rounded-circle object-fit-cover border border-light shadow-sm"
                      style={{ width: "36px", height: "36px" }}
                    />
                    {/* Green dot for online status */}
                    {isOnline && (
                      <span className="position-absolute bottom-0 end-0 bg-success p-1 rounded-circle border border-white"></span>
                    )}
                  </div>
                  <div className="ms-3 text-truncate">
                    <span
                      className="fw-semibold text-dark d-block text-truncate"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {user.full_name || user.user?.username || "User"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default RightSidebar;
