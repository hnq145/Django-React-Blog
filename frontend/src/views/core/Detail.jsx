import { useEffect, useState, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "./../../plugin/Moment";
import Toast from "./../../plugin/Toast";
import AIChatAssistant from "../partials/AIChatAssistant";
import { useTranslation } from "react-i18next";
import "moment/locale/vi";
import "moment/locale/en-gb";

const baseURL = apiInstance.defaults.baseURL.replace("/api/v1", "");

function Detail() {
  const [post, setPost] = useState({});
  const [tags, setTags] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [commentPagination, setCommentPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [createComment, setCreateComment] = useState({
    full_name: "",
    email: "",
    comment: "",
  });
  const [commentSortOrder, setCommentSortOrder] = useState("newest");

  const { t, i18n } = useTranslation();
  const param = useParams();

  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setCommentSortOrder(newSortOrder);
  };

  const fetchPost = useCallback(
    async (sortOrder, page = 1) => {
      try {
        const response = await apiInstance.get(
          `post/detail/${param.slug}/?comment_sort=${sortOrder}&page=${page}`
        );
        setPost(response.data);
        if (response.data.comments) {
          setAllComments(response.data.comments.results);
          setCommentPagination({
            count: response.data.comments.count,
            next: response.data.comments.next,
            previous: response.data.comments.previous,
          });
        }
        if (response.data.tags) {
          const tagArray = response.data.tags.split(",");
          setTags(tagArray);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    },
    [param.slug]
  );

  useEffect(() => {
    fetchPost(commentSortOrder);
  }, [fetchPost, commentSortOrder]);

  useEffect(() => {
    if (!post.id) {
      return;
    }

    const commentSocket = new WebSocket(
      `ws://localhost:8000/ws/posts/${post.id}/comments/`
    );

    commentSocket.onopen = () => {
      console.log(`Comment WebSocket connected for post ${post.id}`);
    };

    commentSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_comment") {
        console.log("New comment received:", data.comment);
        fetchPost(commentSortOrder, 1);
      }
    };

    commentSocket.onclose = () => {
      console.log("Comment WebSocket disconnected");
    };

    commentSocket.onerror = (error) => {
      console.error("Comment WebSocket error:", error);
    };

    return () => {
      commentSocket.close();
    };
  }, [post.id, commentSortOrder, fetchPost]);

  const handleCreateCommentChange = (event) => {
    setCreateComment({
      ...createComment,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateCommentSubmit = async (event) => {
    event.preventDefault();

    const json = {
      post_id: post?.id,
      name: createComment.full_name,
      email: createComment.email,
      comment: createComment.comment,
    };

    try {
      await apiInstance.post("post/comment-post/", json);
      Toast("success", t("detail.commentPosted"));

      setCreateComment({
        full_name: "",
        email: "",
        comment: "",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      Toast("error", t("detail.commentFailed"));
    }
  };

  const handleLikePost = async () => {
    const json = {
      user_id: 1,
      post_id: post?.id,
    };

    try {
      const response = await apiInstance.post(`post/like-post/`, json);
      Toast("success", response.data.message);

      fetchPost(commentSortOrder);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleBookmarkPost = async () => {
    const json = {
      user_id: 1,
      post_id: post?.id,
    };

    try {
      const response = await apiInstance.post(`post/bookmark-post/`, json);
      Toast("success", response.data.message);
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  };

  const handlePageChange = (page) => {
    fetchPost(commentSortOrder, page);
  };

  return (
    <>
      <Header />
      <section className=" mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <a href="#" className="badge bg-info mb-2 text-decoration-none">
                <i className="small fw-bold " />
                {t(`category.${post.category?.title?.toLowerCase()}`, {
                  defaultValue: post.category?.title,
                })}
              </a>
              <h1 className="text-center">{post.title}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-0 mb-5">
        <div className="container position-relative" data-sticky-container="">
          <div className="row">
            <div className="col-lg-2">
              <div
                className="text-start text-lg-center mb-5"
                data-sticky=""
                data-margin-top={80}
                data-sticky-for={991}
              >
                <div className="position-relative">
                  {post?.profile?.image && (
                    <div className="avatar avatar-xl">
                      <img
                        className="avatar-img"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        src={`${baseURL}${post?.profile?.image}`}
                        alt="avatar"
                      />
                    </div>
                  )}
                  <a
                    href="#"
                    className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block"
                  >
                    {post?.user?.username}
                  </a>
                  <p>{post?.profile?.bio || ""}</p>
                </div>

                <hr className="d-none d-lg-block " />

                <ul className="list-inline list-unstyled">
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <i className="fas fa-calendar"></i>{" "}
                    {Moment(post.date, i18n.language)}
                  </li>
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <a href="#" className="text-body">
                      <i className="fas fa-heart me-1" />
                    </a>
                    {post?.likes?.length} {t("detail.likes")}
                  </li>
                  <li className="list-inline-item d-lg-block my-lg-2 text-start">
                    <i className="fas fa-eye" />
                    {post.view} {t("detail.views")}
                  </li>
                </ul>
                {/* Tags */}
                <ul className="list-inline text-primary-hover mt-0 mt-lg-3 text-start">
                  {tags?.map((tag, index) => (
                    <li className="list-inline-item" key={index}>
                      <a
                        className="text-body text-decoration-none fw-bold"
                        href="#"
                      >
                        #{tag}
                      </a>
                    </li>
                  ))}
                </ul>

                <button onClick={handleLikePost} className="btn btn-primary">
                  <i className="fas fa-thumbs-up me-2"></i>
                  {post?.likes?.length}
                </button>

                <button
                  onClick={handleBookmarkPost}
                  className="btn btn-danger ms-2"
                >
                  <i className="fas fa-bookmark"></i>
                </button>
              </div>
            </div>
            {/* Left sidebar END */}
            {/* Main Content START */}
            <div className="col-lg-10 mb-5">
              {post.image && (
                <div className="text-center mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="img-fluid rounded"
                  />
                </div>
              )}
              <p>{post.description}</p>

              {/* AI Summary Section */}
              {post.ai_summary && post.ai_summary.status === "Success" && (
                <div className="alert border-0 ai-summary-box shadow-sm rounded-3 p-4 my-4">
                  <h5 className="text-primary fw-bold mb-3 d-flex align-items-center">
                    <span style={{ fontSize: "24px", marginRight: "10px" }}>
                      ✨
                    </span>
                    {t("detail.aiSummary") || "AI Summary"}
                  </h5>
                  <p
                    className="mb-0 text-dark"
                    style={{ lineHeight: "1.6", fontSize: "1.05rem" }}
                  >
                    {post.ai_summary.summarized_content}
                  </p>
                </div>
              )}

              <hr />
              <AIChatAssistant />
              <div className="d-flex py-4">
                <div>
                  <ul className="nav">
                    <li className="nav-item">
                      <a className="nav-link ps-0 pe-2 fs-5" href="#">
                        <i className="fab fa-facebook-square" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link px-2 fs-5" href="#">
                        <i className="fa-brands fa-x-twitter" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link px-2 fs-5" href="#">
                        <i className="fab fa-linkedin" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <hr />
                <div className="mt-5"></div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>
                    {commentPagination.count} {t("detail.comments")}
                  </h3>
                  <div>
                    <label htmlFor="sort" className="me-2">
                      {t("detail.sortBy")}:
                    </label>
                    <select
                      id="sort"
                      className="form-select"
                      value={commentSortOrder}
                      onChange={handleSortChange}
                      style={{ width: "auto", display: "inline-block" }}
                    >
                      <option value="newest">{t("detail.newest")}</option>
                      <option value="oldest">{t("detail.oldest")}</option>
                    </select>
                  </div>
                </div>
                {allComments?.map((c) => (
                  <div
                    className="my-4 d-flex bg-light p-3 mb-3 rounded"
                    key={c.id}
                  >
                    <div>
                      <div className="mb-2">
                        <h5 className="m-0">{c?.name}</h5>
                        <span className="me-3 small">
                          {Moment(c?.date, i18n.language)}
                        </span>
                      </div>
                      <p className="fw-bold">{c?.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Comments END */}
              {commentPagination.count > 10 && (
                <nav>
                  <ul className="pagination">
                    {commentPagination.previous && (
                      <li className="page-item">
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(
                              new URL(
                                commentPagination.previous
                              ).searchParams.get("page")
                            )
                          }
                        >
                          {t("pagination.previous")}
                        </button>
                      </li>
                    )}

                    {Array.from(
                      { length: Math.ceil(commentPagination.count / 10) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <li className="page-item" key={page}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    {commentPagination.next && (
                      <li className="page-item">
                        <button
                          className="page-link"
                          onClick={() =>
                            handlePageChange(
                              new URL(commentPagination.next).searchParams.get(
                                "page"
                              )
                            )
                          }
                        >
                          {t("pagination.next")}
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              )}
              {/* Reply START */}
              <div className="bg-light p-3 rounded mb-5">
                <h3 className="fw-bold">{t("detail.leaveReply")}</h3>
                <small>{t("detail.emailNotPublished")}</small>
                <form
                  className="row g-3 mt-2"
                  onSubmit={handleCreateCommentSubmit}
                >
                  <div className="col-md-6">
                    <label className="form-label">{t("detail.name")}</label>
                    <input
                      onChange={handleCreateCommentChange}
                      name="full_name"
                      value={createComment.full_name}
                      type="text"
                      className="form-control"
                      aria-label="First name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">{t("detail.email")}</label>
                    <input
                      name="email"
                      value={createComment.email}
                      onChange={handleCreateCommentChange}
                      type="email"
                      className="form-control"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      {t("detail.writeComment")}
                    </label>
                    <textarea
                      name="comment"
                      value={createComment.comment}
                      onChange={handleCreateCommentChange}
                      className="form-control"
                      rows={4}
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      {t("detail.postComment")}{" "}
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ height: "200px" }}></div>
      <Footer />
    </>
  );
}

export default Detail;
