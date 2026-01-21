import { useState, useEffect, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import Sidebar from "../partials/Sidebar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Moment from "../../plugin/Moment";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

import { useWebSocket } from "../../context/WebSocketContext";

const DashboardCommentItem = ({ c, t, i18n }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100; // Character limit for check
  const isLong = c.comment && c.comment.length > maxLength;

  return (
    <div key={c.id}>
      <div className="col-12">
        <div className="d-flex align-items-start position-relative">
          <div className="avatar avatar-lg flex-shrink-0">
            <img
              className="avatar-img"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                c.name || "User",
              )}&background=random&color=fff&size=128`}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              alt="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  c.name || "User",
                )}&background=random&color=fff&size=128`;
              }}
            />
          </div>
          <div className="ms-3 w-100">
            <div className="mb-1">
              <div
                className={`text-dark text-decoration-none ${isExpanded ? "" : "line-clamp-3"}`}
                style={{ fontSize: "1rem", whiteSpace: "pre-wrap" }}
              >
                {c.comment}
              </div>
              {isLong && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="btn btn-link p-0 text-decoration-none mt-1"
                  style={{ fontSize: "0.85rem", fontWeight: "bold" }}
                >
                  {isExpanded
                    ? t("dashboard.showLess", "Rút gọn")
                    : t("dashboard.showMore", "Xem thêm")}
                </button>
              )}
            </div>
            <div className="d-flex justify-content-between">
              <p className="small mb-0 text-muted">
                <i>{t("dashboard.by", "Bởi")}</i> {c.name} •{" "}
                {Moment(c.date, i18n.language)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-3" />
    </div>
  );
};

function Dashboard() {
  const [stats, setStats] = useState({
    views: 0,
    posts: 0,
    likes: 0,
    bookmarks: 0,
  });
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [noti, setNoti] = useState([]);
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const userId = useUserData()?.user_id;

  const { notification, setUnreadCount } = useWebSocket();

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      const stats_res = await apiInstance.get(`author/dashboard/stats/`);
      setStats(
        stats_res.data || { views: 0, posts: 0, likes: 0, bookmarks: 0 },
      );

      const post_res = await apiInstance.get(`author/dashboard/post-list/`);
      setPosts(post_res.data || []);

      const comment_res = await apiInstance.get(
        `author/dashboard/comment-list/`,
      );
      setComments(comment_res.data || []);

      const noti_res = await apiInstance.get(`author/dashboard/noti-list/`);
      setNoti(noti_res.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Optional: Redirect to login if 401? For now just log.
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (notification) {
      setNoti((prevNoti) => [notification, ...prevNoti]);
    }
  }, [notification]);

  const handleMarkNotiAsSeen = async (notiId) => {
    const response = await apiInstance.post(
      "author/dashboard/noti-mark-seen/",
      { noti_id: notiId },
    );
    console.log(response.data);
    fetchDashboardData();
    setUnreadCount((prev) => Math.max(0, prev - 1));
    Toast("success", t("dashboard.notiSeen"), "");
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Header />
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="row g-4">
                <div className="col-12">
                  <div className="row g-4">
                    <div className="col-sm-6 col-lg-3">
                      <div className="card card-body border p-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-xl fs-1 p-3 bg-success bg-opacity-10 rounded-3 text-success">
                            <i className="bi bi-people-fill" />
                          </div>
                          <div className="ms-3">
                            <h3>{stats?.views || 0}</h3>
                            <h6 className="mb-0">
                              {t("dashboard.totalViews")}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="card card-body border p-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-xl fs-1 p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                            <i className="bi bi-file-earmark-text-fill" />
                          </div>
                          <div className="ms-3">
                            <h3>{stats?.posts || 0}</h3>
                            <h6 className="mb-0">{t("dashboard.posts")}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="card card-body border p-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-xl fs-1 p-3 bg-danger bg-opacity-10 rounded-3 text-danger">
                            <i className="bi bi-suit-heart-fill" />
                          </div>
                          <div className="ms-3">
                            <h3>{stats?.likes || 0}</h3>
                            <h6 className="mb-0">{t("dashboard.likes")}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="card card-body border p-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-xl fs-1 p-3 bg-info bg-opacity-10 rounded-3 text-info">
                            <i className="bi bi-tag" />
                          </div>
                          <div className="ms-3">
                            <h3>{stats?.bookmarks || 0}</h3>
                            <h6 className="mb-0">{t("dashboard.bookmarks")}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border h-100">
                    <div className="card-header border-bottom p-3">
                      <h5 className="card-header-title mb-0">
                        {t(
                          "dashboard.analytics_overview",
                          "Analytics Overview",
                        )}
                      </h5>
                    </div>
                    <div className="card-body p-4" style={{ height: "300px" }}>
                      <Bar
                        data={{
                          labels: posts
                            ?.sort((a, b) => b.view - a.view)
                            .slice(0, 5)
                            .map(
                              (p) =>
                                p.title.substring(0, 15) +
                                (p.title.length > 15 ? "..." : ""),
                            ),
                          datasets: [
                            {
                              label: t("dashboard.views", "Lượt xem"),
                              data: posts
                                ?.sort((a, b) => b.view - a.view)
                                .slice(0, 5)
                                .map((p) => p.view),
                              backgroundColor: [
                                "rgba(255, 99, 132, 0.6)",
                                "rgba(54, 162, 235, 0.6)",
                                "rgba(255, 206, 86, 0.6)",
                                "rgba(75, 192, 192, 0.6)",
                                "rgba(153, 102, 255, 0.6)",
                              ],
                              borderColor: [
                                "rgba(255, 99, 132, 1)",
                                "rgba(54, 162, 235, 1)",
                                "rgba(255, 206, 86, 1)",
                                "rgba(75, 192, 192, 1)",
                                "rgba(153, 102, 255, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: true,
                              text: t(
                                "dashboard.topViewedPosts",
                                "Top 5 bài viết xem nhiều nhất",
                              ),
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xxl-4">
                  <div className="card border h-100">
                    <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                      <h5 className="card-header-title mb-0">
                        {t("dashboard.allPosts")} ({posts?.length})
                      </h5>
                      <div className="dropdown text-end">
                        <a
                          href="#"
                          className="btn border-0 p-0 mb-0"
                          role="button"
                          id="dropdownShare3"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-grid-fill text-danger fa-fw" />
                        </a>
                      </div>
                    </div>
                    <div className="card-body p-3">
                      <div className="row">
                        {posts?.slice(0, 5).map((p) => (
                          <div key={p.id}>
                            <div className="col-12">
                              <div className="d-flex position-relative">
                                <img
                                  className="w-60 rounded"
                                  src={p.image}
                                  style={{
                                    width: "100px",
                                    height: "110px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                  }}
                                  alt="product"
                                />{" "}
                                <div className="ms-3">
                                  <a
                                    href="#"
                                    className="h6 stretched-link text-decoration-none text-dark"
                                  >
                                    {p.title}
                                  </a>
                                  <p className="small mb-0 mt-3">
                                    <i className="fas fa-calendar me-2"></i>
                                    {Moment(p.date, i18n.language)}
                                  </p>
                                  <p className="small mb-0">
                                    <i className="fas fa-eye me-2"></i>
                                    {p.view} {t("dashboard.views")}
                                  </p>
                                  <p className="small mb-0">
                                    <i className="fas fa-thumbs-up me-2"></i>
                                    {p.likes?.length} {t("dashboard.likes")}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <hr className="my-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card-footer border-top text-center p-3">
                      <Link
                        to="/posts/"
                        className="fw-bold text-decoration-none text-dark"
                      >
                        {t("dashboard.viewAllPosts")}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xxl-4">
                  <div className="card border h-100">
                    <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                      <h5 className="card-header-title mb-0">
                        {t("dashboard.comments")} ({comments?.length})
                      </h5>
                      <div className="dropdown text-end">
                        <a
                          href="#"
                          className="btn border-0 p-0 mb-0"
                          role="button"
                          id="dropdownShare3"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-chat-left-quote-fill text-success fa-fw" />
                        </a>
                      </div>
                    </div>
                    <div className="card-body p-3">
                      <div className="row">
                        {comments?.slice(0, 5).map((c) => (
                          <DashboardCommentItem
                            key={c.id}
                            c={c}
                            t={t}
                            i18n={i18n}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="card-footer border-top text-center p-3">
                      <Link
                        to="/comments/"
                        className="fw-bold text-decoration-none text-dark"
                      >
                        {t("dashboard.viewAllComments")}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xxl-4">
                  <div className="card border h-100">
                    <div className="card-header border-bottom d-flex justify-content-between align-items-center  p-3">
                      <h5 className="card-header-title mb-0">
                        {t("dashboard.notifications")} ({noti?.length})
                      </h5>
                      <div className="dropdown text-end d-flex align-items-center gap-2">
                        {noti?.length > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await apiInstance.post(
                                  "author/dashboard/noti-mark-all-seen/",
                                );
                                fetchDashboardData();
                                setUnreadCount(0);
                                Toast(
                                  "success",
                                  t("dashboard.allNotiSeen", "Đã đọc tất cả"),
                                  "",
                                );
                              } catch (error) {
                                console.error(error);
                              }
                            }}
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="tooltip"
                            title={t(
                              "dashboard.markAllAsRead",
                              "Đánh dấu tất cả là đã đọc",
                            )}
                          >
                            <i className="fas fa-check-double"></i>
                          </button>
                        )}
                        <a
                          href="#"
                          className="btn border-0 p-0 mb-0"
                          role="button"
                          id="dropdownShare3"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fas fa-bell text-warning fa-fw" />
                        </a>
                      </div>
                    </div>
                    <div className="card-body p-3">
                      <div className="custom-scrollbar h-350">
                        <div className="row">
                          {noti?.slice(0, 5)?.map((n) => (
                            <div key={n.id}>
                              <div className="col-12">
                                <div className="d-flex justify-content-between position-relative">
                                  <div className="d-sm-flex">
                                    <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                      {n.type === "Like" && (
                                        <i className="fas fa-thumbs-up text-primary fs-5" />
                                      )}
                                    </div>
                                    <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                      {n.type === "Comment" && (
                                        <i className="bi bi-chat-left-quote-fill  text-success fs-5" />
                                      )}
                                    </div>
                                    <div className="icon-lg bg-opacity-15 rounded-2 flex-shrink-0">
                                      {n.type === "Bookmark" && (
                                        <i className="fas fa-bookmark text-danger fs-5" />
                                      )}
                                    </div>
                                    <div className="ms-0 ms-sm-3 mt-2 mt-sm-0">
                                      <h6 className="mb-0">{n.type}</h6>
                                      <div className="mb-0">
                                        {n.type === "Like" && (
                                          <span>
                                            {t("dashboard.someoneLiked")}{" "}
                                            <Link
                                              to={`/post/${n.post?.slug}/`}
                                              className="fw-bold text-dark text-decoration-none"
                                            >
                                              {n.post?.title?.slice(0, 30) +
                                                "..."}
                                            </Link>
                                          </span>
                                        )}
                                        {n.type === "Comment" && (
                                          <span>
                                            {t("dashboard.newComment")}{" "}
                                            <Link
                                              to={`/post/${n.post?.slug}/`}
                                              className="fw-bold text-dark text-decoration-none"
                                            >
                                              {n.post?.title?.slice(0, 30) +
                                                "..."}
                                            </Link>
                                          </span>
                                        )}
                                        {n.type === "Bookmark" && (
                                          <span>
                                            {t("dashboard.someoneBookmarked")}{" "}
                                            <Link
                                              to={`/post/${n.post?.slug}/`}
                                              className="fw-bold text-dark text-decoration-none"
                                            >
                                              {n.post?.title?.slice(0, 30) +
                                                "..."}
                                            </Link>
                                          </span>
                                        )}
                                      </div>
                                      <span className="small">
                                        {t("dashboard.fiveMinAgo")}
                                      </span>
                                      <br />
                                      <button
                                        onClick={() =>
                                          handleMarkNotiAsSeen(n.id)
                                        }
                                        className="btn btn-secondary mt-2"
                                      >
                                        <i className="fas fa-check-circle"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr className="my-3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="card-footer border-top text-center p-3">
                      <Link
                        to="/notifications/"
                        className="fw-bold text-decoration-none text-dark"
                      >
                        {t("dashboard.viewAllNotifications")}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border bg-transparent rounded-3">
                    <div className="card-header bg-transparent border-bottom p-3">
                      <div className="d-sm-flex justify-content-between align-items-center">
                        <h5 className="mb-2 mb-sm-0">
                          {t("dashboard.allBlogPosts")}{" "}
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {posts?.length}
                          </span>
                        </h5>
                        <a href="#" className="btn btn-sm btn-primary mb-0">
                          {t("dashboard.addNew")}{" "}
                          <i className="fas fa-plus"></i>
                        </a>
                      </div>
                    </div>
                    <div className="card-body">
                      {/* Search and select END */}
                      {/* Blog list table START */}
                      <div className="table-responsive border-0">
                        <table className="table align-middle p-4 mb-0 table-hover table-shrink">
                          {/* Table head */}
                          <thead className="table-dark">
                            <tr>
                              <th
                                scope="col"
                                className="border-0 rounded-start"
                              >
                                {t("dashboard.articleName")}
                              </th>
                              <th scope="col" className="border-0">
                                {t("dashboard.views")}
                              </th>
                              <th scope="col" className="border-0">
                                {t("dashboard.publishedDate")}
                              </th>
                              <th scope="col" className="border-0">
                                {t("dashboard.category")}
                              </th>
                              <th scope="col" className="border-0">
                                {t("dashboard.status")}
                              </th>
                              <th scope="col" className="border-0 rounded-end">
                                {t("dashboard.action")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="border-top-0">
                            {currentPosts?.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <h6 className="mt-2 mt-md-0 mb-0 ">
                                    <a
                                      href="#"
                                      className="text-dark text-decoration-none"
                                    >
                                      {p?.title}
                                    </a>
                                  </h6>
                                </td>
                                <td>
                                  <h6 className="mb-0">
                                    <a
                                      href="#"
                                      className="text-dark text-decoration-none"
                                    >
                                      {p.view} {t("dashboard.views")}
                                    </a>
                                  </h6>
                                </td>
                                <td>{Moment(p.date, i18n.language)}</td>
                                <td>
                                  {t(
                                    `category.${p.category?.title?.toLowerCase()}`,
                                  )}
                                </td>
                                <td>
                                  <span className="badge bg-dark bg-opacity-10 text-dark mb-2">
                                    {t(
                                      `status.${p.status.toLowerCase().replace(" ", "_")}`,
                                    )}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn-round mb-0 btn btn-danger"
                                      data-bs-toggle="tooltip"
                                      data-bs-placement="top"
                                      title="Delete"
                                      onClick={async (e) => {
                                        e.preventDefault();

                                        // Fallback translation logic
                                        const lang = i18n.language;
                                        const txt = {
                                          title:
                                            t("dashboard.confirmDelete") !==
                                            "dashboard.confirmDelete"
                                              ? t("dashboard.confirmDelete")
                                              : lang === "vi"
                                                ? "Bạn có chắc chắn không?"
                                                : "Are you sure?",
                                          text:
                                            t("dashboard.deleteWarning") !==
                                            "dashboard.deleteWarning"
                                              ? t("dashboard.deleteWarning")
                                              : lang === "vi"
                                                ? "Hành động này không thể hoàn tác!"
                                                : "You won't be able to revert this!",
                                          confirm:
                                            t("dashboard.deleteConfirm") !==
                                            "dashboard.deleteConfirm"
                                              ? t("dashboard.deleteConfirm")
                                              : lang === "vi"
                                                ? "Vâng, xóa nó!"
                                                : "Yes, delete it!",
                                          cancel:
                                            t("dashboard.cancel") !==
                                            "dashboard.cancel"
                                              ? t("dashboard.cancel")
                                              : lang === "vi"
                                                ? "Hủy bỏ"
                                                : "Cancel",
                                          deletedTitle:
                                            lang === "vi"
                                              ? "Đã xóa!"
                                              : "Deleted!",
                                          deletedText:
                                            t("dashboard.postDeleted") !==
                                            "dashboard.postDeleted"
                                              ? t("dashboard.postDeleted")
                                              : lang === "vi"
                                                ? "Bài viết đã được xóa thành công."
                                                : "Post deleted successfully.",
                                          errorTitle:
                                            lang === "vi" ? "Lỗi!" : "Error!",
                                          errorText:
                                            t("dashboard.deleteFailed") !==
                                            "dashboard.deleteFailed"
                                              ? t("dashboard.deleteFailed")
                                              : lang === "vi"
                                                ? "Xóa bài viết thất bại."
                                                : "Failed to delete post.",
                                        };

                                        const result = await Swal.fire({
                                          title: txt.title,
                                          text: txt.text,
                                          icon: "warning",
                                          showCancelButton: true,
                                          confirmButtonColor: "#d33",
                                          cancelButtonColor: "#3085d6",
                                          confirmButtonText: txt.confirm,
                                          cancelButtonText: txt.cancel,
                                        });

                                        if (result.isConfirmed) {
                                          try {
                                            await apiInstance.delete(
                                              `author/dashboard/post-detail/${p.id}/`,
                                            );
                                            Swal.fire(
                                              txt.deletedTitle,
                                              txt.deletedText,
                                              "success",
                                            );
                                            fetchDashboardData();
                                          } catch (err) {
                                            console.error(err);
                                            Swal.fire(
                                              txt.errorTitle,
                                              txt.errorText,
                                              "error",
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      <i className="bi bi-trash" />
                                    </button>
                                    <Link
                                      to={`/edit-post/${p.id}/`}
                                      className="btn btn-primary btn-round mb-0"
                                      data-bs-toggle="tooltip"
                                      data-bs-placement="top"
                                      title="Edit"
                                    >
                                      <i className="bi bi-pencil-square" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                          <nav>
                            <ul className="pagination">
                              <li
                                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handlePageChange(currentPage - 1)
                                  }
                                >
                                  {t("pagination.previous")}
                                </button>
                              </li>
                              {Array.from({ length: totalPages }, (_, i) => (
                                <li
                                  key={i}
                                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(i + 1)}
                                  >
                                    {i + 1}
                                  </button>
                                </li>
                              ))}
                              <li
                                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    handlePageChange(currentPage + 1)
                                  }
                                >
                                  {t("pagination.next")}
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </div>
                  </div>
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

export default Dashboard;
