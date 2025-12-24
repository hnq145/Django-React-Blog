import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import Moment from "./../../plugin/Moment";
import Toast from "../../plugin/Toast";
import { useTranslation } from "react-i18next";

function Notifications() {
  const [noti, setNoti] = useState([]);
  const { t } = useTranslation();

  const fetchNoti = React.useCallback(async () => {
    try {
      const noti_res = await apiInstance.get(
        `author/dashboard/noti-list/`
      );
      setNoti(noti_res.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchNoti();
  }, [fetchNoti]);

  const hanleMarkNotiAsSeen = async (notiId) => {
    try {
      await apiInstance.post(
        `author/dashboard/noti-mark-seen/`,
        { noti_id: notiId }
      );
      fetchNoti();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              <div className="card mb-4">
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">
                      {t("notifications.notifications")}{" "}
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {noti?.length}
                      </span>
                    </h3>
                    <span>{t("notifications.manageNotifications")}</span>
                  </div>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {noti?.map((n) => (
                      <li
                        key={n.id}
                        className="list-group-item p-4 shadow rounded-3 mt-4"
                      >
                        <div className="d-flex">
                          <div className="ms-3 mt-2">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <div className="mb-0 fw-bold">
                                  {n.type == "Like" && (
                                    <>
                                      <h4>
                                        <i className="fas fa-thumbs-up text-primary "></i>{" "}
                                        {t("notifications.newLike")}
                                      </h4>
                                      <p className="mt-3">
                                        {t("notifications.likedPost")}{" "}
                                        <b>{n?.post?.title}</b>
                                      </p>
                                    </>
                                  )}

                                  {n.type == "Comment" && (
                                    <>
                                      <h4>
                                        <i className="bi bi-chat-left-quote-fill text-success "></i>{" "}
                                        {t("notifications.newComment")}
                                      </h4>
                                      <p className="mt-3">
                                        {t("notifications.commentedPost")}{" "}
                                        <b>{n?.post?.title}</b>
                                      </p>
                                    </>
                                  )}

                                  {n.type == "Bookmark" && (
                                    <>
                                      <h4>
                                        <i className="fas fa-bookmark text-danger "></i>{" "}
                                        {t("notifications.newBookmark")}
                                      </h4>
                                      <p className="mt-3">
                                        {t("notifications.bookmarkedPost")}{" "}
                                        <b>{n?.post?.title}</b>
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="mt-1">
                                <span className="me-2 fw-bold">
                                  {t("notifications.date")}:{" "}
                                  <span className="fw-light">
                                    {Moment(n?.date)}
                                  </span>
                                </span>
                              </p>
                              <p>
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => hanleMarkNotiAsSeen(n.id)}
                                >
                                  {t("notifications.markAsSeen")} <i className="fas fa-check"></i>
                                </button>
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}

                    {noti.length < 1 && <p>{t("notifications.noNotifications")}</p>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Notifications;
