import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import { useAuthStore } from "../../store/auth";
import { useTranslation } from "react-i18next";

const UserHoverCard = ({ userId, children }) => {
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const timerRef = useRef(null);
  const { user: currentUser } = useAuthStore((state) => state);
  const { t } = useTranslation();

  const handleMouseEnter = () => {
    // Calculate position before showing
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    // Delay showing
    timerRef.current = setTimeout(() => {
      setShow(true);
      if (!profile) {
        fetchProfile();
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(false);
    }, 300);
  };

  const cancelClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`user/profile/${userId}/`);
      setProfile(res.data);
      setIsFollowing(res.data.is_following);
    } catch (error) {
      console.error("Failed to fetch profile for hover card", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert("Please login to follow");
      return;
    }
    try {
      await apiInstance.post(`user/follow/${userId}/`);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  const isSelf = currentUser?.user_id === userId;

  const HoverContent = (
    <div
      className="position-absolute text-start shadow-lg rounded-3 border"
      style={{
        width: "350px",
        zIndex: 99999,
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        backgroundColor: "#201f1f", // Dark theme
        color: "white",
        animation: "fadeIn 0.2s ease-out",
      }}
      onMouseEnter={cancelClose}
      onMouseLeave={handleMouseLeave}
    >
      {loading && !profile ? (
        <div className="text-center py-4">
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          ></div>
        </div>
      ) : profile && profile.user ? (
        <div>
          {/* Header */}
          <div className="d-flex align-items-center p-3 border-bottom border-secondary">
            <div className="position-relative">
              <img
                src={profile.image}
                alt={profile.full_name || "User"}
                className="rounded-circle object-fit-cover bg-white"
                style={{ width: "70px", height: "70px" }}
              />
              <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-dark rounded-circle">
                <span className="visually-hidden">Online</span>
              </span>
            </div>
            <div className="ms-3 overflow-hidden">
              <h5 className="fw-bold mb-0 text-white text-truncate">
                {profile.full_name || profile.user?.username || "Unknown"}
              </h5>
              <small className="text-secondary d-block">
                {profile.bio || "Available"}
              </small>
            </div>
            <div className="ms-auto align-self-start">
              <Link
                to={`/profile/${profile.user?.id}/`}
                className="text-white-50 hover-light"
              >
                <i className="fas fa-external-link-alt"></i>
              </Link>
            </div>
          </div>

          {/* Status */}
          <div className="p-3 border-bottom border-secondary bg-dark bg-opacity-50">
            <div className="d-flex align-items-center mb-2">
              <i
                className="far fa-clock text-white-50 me-2"
                style={{ width: "20px" }}
              ></i>
              <small className="text-white-50">
                {t("hover.localtime", "Local Time")}:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
            {profile.user?.email && (
              <div className="d-flex align-items-center text-truncate">
                <i
                  className="far fa-envelope text-white-50 me-2"
                  style={{ width: "20px" }}
                ></i>
                <a
                  href={`mailto:${profile.user.email}`}
                  className="text-white small text-decoration-none text-truncate"
                >
                  {profile.user.email}
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 d-flex gap-2">
            <div className="flex-grow-1">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-white border-secondary rounded-pill"
                placeholder={`Message ${profile.user?.username || "User"}...`}
                readOnly
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/chat/`;
                }}
              />
            </div>
            {!isSelf && (
              <>
                <Link
                  to="/chat/"
                  state={{ partnerId: profile.user?.id }}
                  className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "32px", height: "32px" }}
                  title="Send Message"
                >
                  <i className="fas fa-paper-plane fa-xs"></i>
                </Link>

                <button
                  onClick={handleFollow}
                  className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${isFollowing ? "btn-secondary" : "btn-outline-light"}`}
                  style={{ width: "32px", height: "32px" }}
                  title={isFollowing ? "Unfollow" : "Follow"}
                >
                  <i
                    className={`fas ${isFollowing ? "fa-user-check" : "fa-user-plus"} fa-xs`}
                  ></i>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <p className="small text-white-50 text-center py-3 mb-0">
          Cannot load info
        </p>
      )}
      <style>
        {`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(5px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .hover-light:hover { color: #fff !important; }
        `}
      </style>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="d-inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {show && createPortal(HoverContent, document.body)}
    </>
  );
};

export default UserHoverCard;
