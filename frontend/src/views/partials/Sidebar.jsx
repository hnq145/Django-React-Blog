import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logout } from "../../utils/auth";
import useUserData from "../../plugin/useUserData";
import apiInstance from "../../utils/axios";

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;
  const userData = useUserData();
  const userId = userData?.user_id;
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (userId) {
      apiInstance
        .get(`user/profile/${userId}/`)
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.error("Sidebar profile fetch error", err));
    }
  }, [userId]);

  const isActive = (route) => {
    return path === route ? "active" : "";
  };

  return (
    <div className="col-lg-3 col-md-4 col-12 border-end d-none d-md-block">
      <div className="d-flex align-items-center mb-4">
        <Link
          to={`/profile/`}
          className="text-dark d-flex align-items-center text-decoration-none"
        >
          <img
            src={
              profile?.image ||
              `https://ui-avatars.com/api/?name=${
                userData?.username || "User"
              }&background=random`
            }
            alt="avatar"
            className="avatar-md rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <div>
            <h6 className="mb-0 fw-bold">
              {profile?.full_name || userData?.username}
            </h6>
            <small className="text-muted">
              {t("sidebar.author", "Author")}
            </small>
          </div>
        </Link>
      </div>
      <div className="list-group list-group-flush">
        <Link
          to="/dashboard/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/dashboard/")}`}
        >
          <i className="bi bi-grid-fill me-2"></i>{" "}
          {t("sidebar.dashboard", "Dashboard")}
        </Link>
        <Link
          to="/posts/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/posts/")}`}
        >
          <i className="bi bi-file-earmark-text-fill me-2"></i>{" "}
          {t("sidebar.posts", "Posts")}
        </Link>
        <Link
          to="/add-post/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/add-post/")}`}
        >
          <i className="bi bi-plus-circle-fill me-2"></i>{" "}
          {t("sidebar.addPost", "Add Post")}
        </Link>
        <Link
          to="/comments/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/comments/")}`}
        >
          <i className="bi bi-chat-left-quote-fill me-2"></i>{" "}
          {t("sidebar.comments", "Comments")}
        </Link>
        <Link
          to="/notifications/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/notifications/")}`}
        >
          <i className="bi bi-bell-fill me-2"></i>{" "}
          {t("sidebar.notifications", "Notifications")}
        </Link>
        <Link
          to="/profile/"
          className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 ${isActive("/profile/")}`}
        >
          <i className="bi bi-person-circle me-2"></i>{" "}
          {t("sidebar.profile", "Profile")}
        </Link>
        <button
          onClick={logout}
          className="list-group-item list-group-item-action border-0 rounded-3 mb-2 px-3 text-danger bg-transparent"
        >
          <i className="bi bi-box-arrow-right me-2"></i>{" "}
          {t("sidebar.logout", "Logout")}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
