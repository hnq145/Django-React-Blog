import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import { useTranslation } from "react-i18next";

function UserListModal({ show, onHide, title, fetchUrl }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (show && fetchUrl) {
      setLoading(true);
      apiInstance
        .get(fetchUrl)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setUsers([]);
    }
  }, [show, fetchUrl]);

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : users.length > 0 ? (
              <ul className="list-group list-group-flush">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="list-group-item d-flex align-items-center border-0 px-2 py-2 hover-bg-light rounded"
                  >
                    <Link
                      to={`/profile/${user.id}/`}
                      onClick={onHide}
                      className="d-flex align-items-center text-decoration-none w-100"
                    >
                      <div className="position-relative me-3">
                        <img
                          src={
                            user.image ||
                            `https://ui-avatars.com/api/?name=${user.username}&background=random`
                          }
                          alt={user.username}
                          className="rounded-circle border"
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark">
                          {user.full_name || user.username}
                        </div>
                        <small className="text-muted">@{user.username}</small>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-users-slash fs-3 mb-2"></i>
                <p>{t("common.noUsersFound", "No users found")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserListModal;
