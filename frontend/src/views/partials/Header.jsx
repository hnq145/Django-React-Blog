import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useTranslation } from "react-i18next";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";

import { useWebSocket } from "../../context/WebSocketContext";

function Header() {
  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);
  const { unreadCount, notifications, setNotifications, setUnreadCount } =
    useWebSocket() || {
      unreadCount: 0,
      notifications: [],
      setNotifications: () => {},
      setUnreadCount: () => {},
    };
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // Search
  const [messages, setMessages] = useState([]); // Chat Inbox
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiInstance.get("post/category/list/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (isLoggedIn() && user?.user_id) {
        try {
          const res = await apiInstance.get(`chat/inbox/${user.user_id}/`);
          setMessages(res.data);

          // Calculate unread count logic
          // Assuming backend doesn't give a total count, we iterate.
          // Or if 'is_read' is on 'latest_message'.
          // If the latest message is NOT from me AND is_read is false, count it.
          // NOTE: This is an approximation as it only counts UNREAD CONVERSATIONS based on latest message.
          // A better backend 'unread_count' endpoint is ideal, but this works for now.
          const count = res.data.filter(
            (m) =>
              !m.latest_message.is_read &&
              m.latest_message.sender !== user.user_id,
          ).length;
          setUnreadMsgCount(count);
        } catch (error) {
          console.error("Error fetching header messages:", error);
        }
      }
    };

    fetchMessages();

    // Listen for custom event to refresh immediately
    const handleMessageRead = () => fetchMessages();
    window.addEventListener("messagesRead", handleMessageRead);

    // Optional: Refresh periodically or listen to websocket (if socket context provides chat events)
    const interval = setInterval(fetchMessages, 30000); // Poll every 30s as backup
    return () => {
      clearInterval(interval);
      window.removeEventListener("messagesRead", handleMessageRead);
    };
  }, [isLoggedIn, user]);

  return (
    <header className="header-static navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <nav className="container-fluid px-lg-4">
        {/* Mobile Toggle */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse justify-content-between"
          id="navbarCollapse"
        >
          {/* Left Side: Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-bold text-dark" to="/">
                {t("header.home")}
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle fw-bold text-dark"
                href="#"
                id="pagesMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("header.category")}
              </a>
              <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link className="dropdown-item" to={`/category/${c.slug}/`}>
                      {c?.title
                        ? t(`category.${c.title.toLowerCase()}`, {
                            defaultValue: c.title,
                          })
                        : "Untitled"}
                      {c?.post_count !== undefined && ` (${c.post_count})`}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle fw-bold text-dark"
                href="#"
                id="dashboardMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t("header.dashboard")}
              </a>
              <ul className="dropdown-menu" aria-labelledby="dashboardMenu">
                <li>
                  <Link className="dropdown-item" to="/dashboard/">
                    {t("header.dashboard")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/posts/">
                    {t("header.posts")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/add-post/">
                    {t("header.addPost")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/categories/">
                    {t("header.categories", "Danh mục")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile/">
                    {t("header.profile")}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* Center: Search Bar */}
          <div
            className="flex-grow-1 mx-lg-4 position-relative d-flex justify-content-center"
            style={{ maxWidth: "500px" }}
          >
            <form
              className="w-100 position-relative"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                className="form-control rounded-pill ps-4 pe-5 bg-light border-0"
                type="search"
                placeholder={t("header.search")}
                aria-label="Search"
                onChange={async (e) => {
                  const query = e.target.value;
                  if (query.length > 2) {
                    try {
                      const response = await apiInstance.get(`post/lists/`);
                      const filtered = response.data.filter((p) =>
                        p.title.toLowerCase().includes(query.toLowerCase()),
                      );
                      setSuggestions(filtered.slice(0, 5));
                    } catch (err) {
                      console.error(err);
                    }
                  } else {
                    setSuggestions([]);
                  }
                }}
              />
              <Link
                to={"/search/"}
                className="btn bg-transparent border-0 px-2 position-absolute top-50 end-0 translate-middle-y me-2"
                type="submit"
              >
                <i className="bi bi-search text-secondary"> </i>
              </Link>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div
                  className="position-absolute w-100 mt-2 bg-white border rounded shadow-lg p-2"
                  style={{ zIndex: 1050, top: "100%" }}
                >
                  <ul className="list-unstyled mb-0">
                    {suggestions.map((s) => (
                      <li key={s.id} className="mb-2 border-bottom pb-1">
                        <Link
                          to={`/post/${s.slug}/`}
                          className="text-decoration-none text-dark d-block"
                          onClick={() => setSuggestions([])}
                        >
                          <small className="fw-bold">{s.title}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>

          <div className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center gap-3">
            {/* Messages (Facebook Style) */}
            {isLoggedIn() && (
              <div className="nav-item dropdown">
                <a
                  className="nav-link text-dark p-0 border-0 position-relative me-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fab fa-facebook-messenger fs-4 text-primary"></i>
                  {unreadMsgCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {unreadMsgCount}
                    </span>
                  )}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-0"
                  style={{
                    width: "360px",
                    maxHeight: "500px",
                    overflowY: "auto",
                    borderRadius: "10px",
                  }}
                >
                  <li className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white rounded-top sticky-top">
                    <h5 className="m-0 fw-bold">
                      {t("header.messages", "Chats")}
                    </h5>
                    <div className="d-flex gap-2">
                      <Link
                        to="/chat/"
                        className="text-decoration-none small fw-bold text-primary"
                      >
                        {t("header.seeAll", "See all")}
                      </Link>
                    </div>
                  </li>

                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <li key={index}>
                        <Link
                          to="/chat/"
                          state={{ partnerId: msg.partner.user.id }}
                          className="dropdown-item p-2 border-bottom d-flex align-items-center hover-bg-light position-relative"
                        >
                          <div className="position-relative me-3">
                            <img
                              src={msg.partner.image}
                              alt={msg.partner.full_name}
                              className="rounded-circle object-fit-cover"
                              style={{ width: "50px", height: "50px" }}
                            />
                            {/* Simple online status indicator simulation (green dot) */}
                            <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 fw-bold text-truncate">
                              {msg.partner.full_name ||
                                msg.partner.user.username}
                            </h6>
                            <div className="d-flex justify-content-between align-items-center small">
                              <span
                                className={`text-truncate ${!msg.latest_message.is_read && msg.latest_message.sender !== user?.user_id ? "fw-bold text-dark" : "text-muted"}`}
                                style={{ maxWidth: "180px" }}
                              >
                                {msg.latest_message.sender === user?.user_id
                                  ? "You: "
                                  : ""}
                                {msg.latest_message.message}
                              </span>
                              <span
                                className="text-muted ms-2"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {Moment(msg.latest_message.date, i18n.language)}
                              </span>
                            </div>
                          </div>
                          {!msg.latest_message.is_read &&
                            msg.latest_message.sender !== user?.user_id && (
                              <div className="ms-2">
                                <span
                                  className="bg-primary rounded-circle d-inline-block"
                                  style={{ width: "10px", height: "10px" }}
                                ></span>
                              </div>
                            )}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-muted">
                      <i className="fab fa-facebook-messenger fs-1 mb-2 text-black-50"></i>
                      <p className="mb-0">
                        {t("header.noMessages", "No messages yet.")}
                      </p>
                      <Link
                        to="/chat/"
                        className="btn btn-sm btn-primary mt-2 rounded-pill"
                      >
                        {t("header.startChat", "Start a conversation")}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Notifications */}
            {isLoggedIn() && (
              <div className="nav-item dropdown">
                <a
                  className="nav-link text-dark p-0 border-0 position-relative me-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-bell fs-5"></i>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-0"
                  style={{
                    width: "320px",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <li className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
                    <h6 className="m-0 fw-bold">
                      {t("header.notifications", "Notifications")}
                    </h6>
                    {unreadCount > 0 && (
                      <small
                        className="fw-bold text-primary cursor-pointer"
                        onClick={async () => {
                          try {
                            await apiInstance.post(
                              "author/dashboard/noti-mark-all-seen/",
                            );
                            setUnreadCount(0);
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, is_seen: true })),
                            );
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {t("header.markAllRead", "Mark all read")}
                      </small>
                    )}
                  </li>
                  {notifications?.length > 0 ? (
                    notifications.map((n) => (
                      <li key={n.id}>
                        <Link
                          to={`/post/${n.post?.slug || n.post_slug || ""}/`} // Fallback if slug missing
                          className={`dropdown-item p-3 border-bottom ${!n.seen ? "bg-light" : ""}`}
                          onClick={async () => {
                            if (!n.seen) {
                              try {
                                await apiInstance.post(
                                  "author/dashboard/noti-mark-seen/",
                                  { noti_id: n.id },
                                );
                                setNotifications((prev) =>
                                  prev.map((item) =>
                                    item.id === n.id
                                      ? { ...item, seen: true }
                                      : item,
                                  ),
                                );
                                setUnreadCount((prev) => Math.max(0, prev - 1));
                              } catch (e) {
                                console.error("Error marking seen", e);
                              }
                            }
                          }}
                          style={{ whiteSpace: "normal" }}
                        >
                          <div className="d-flex align-items-start">
                            <div className="flex-grow-1">
                              <small className="d-block text-muted mb-1">
                                {Moment(n.date)}
                              </small>
                              <div className="small">
                                <span className="fw-bold">
                                  {n.sender?.username ||
                                    t("common.someone", "Someone")}
                                </span>{" "}
                                {n.type === "Like"
                                  ? t(
                                      "notification.liked_your_post",
                                      "liked your post",
                                    )
                                  : n.type === "Comment"
                                    ? t(
                                        "notification.commented_on_your_post",
                                        "commented on your post",
                                      )
                                    : n.type === "Follow"
                                      ? t(
                                          "notification.followed_you",
                                          "followed you",
                                        )
                                      : t(
                                          "notification.interacted_with_you",
                                          "interacted with you",
                                        )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-muted">
                      <i className="fas fa-bell-slash fs-4 mb-2"></i>
                      <p className="m-0 small">
                        {t("header.noNotifications", "No notifications")}
                      </p>
                    </li>
                  )}
                  <li className="p-2 text-center bg-light rounded-bottom">
                    <Link
                      to="/notifications/"
                      className="small text-decoration-none fw-bold"
                    >
                      {t("header.viewAll", "View all")}
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Dark Mode */}
            <button
              className="btn btn-link text-dark p-0 border-0"
              onClick={() => {
                document.body.classList.toggle("dark-theme");
                setDarkMode(!darkMode);
              }}
            >
              {darkMode ? (
                <i className="fas fa-sun text-warning fs-5"></i>
              ) : (
                <i className="fas fa-moon text-secondary fs-5"></i>
              )}
            </button>

            {/* Language */}
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle fw-bold text-dark"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                {i18n.language === "vi"
                  ? t("header.vietnamese")
                  : t("header.english")}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage("en");
                    }}
                  >
                    {t("header.english")}
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      changeLanguage("vi");
                    }}
                  >
                    {t("header.vietnamese")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Auth Buttons */}
            {isLoggedIn() ? (
              <div className="d-flex gap-2">
                <Link
                  to={"/profile/"}
                  className="btn btn-primary d-flex align-items-center gap-2 btn-sm rounded-pill px-3"
                >
                  {t("header.profile")} <i className="fas fa-user-circle"></i>
                </Link>
                <Link
                  to={"/logout/"}
                  className="btn btn-outline-danger d-flex align-items-center gap-2 btn-sm rounded-pill px-3"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Link>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to={"/login/"}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                >
                  {t("header.login")}
                </Link>
                <Link
                  to={"/register/"}
                  className="btn btn-primary btn-sm rounded-pill px-3"
                >
                  {t("header.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
// Updated Header Logic to fix category translation
