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

const CommentItem = ({ comment, t, i18n, handleReply }) => {
  return (
    <div
      className={`d-flex ${comment.parent ? "ms-5 border-start ps-3" : ""} bg-light p-3 mb-3 rounded flex-column`}
    >
      <div className="d-flex justify-content-between">
        <div className="mb-2">
          <h5 className="m-0">{comment?.name}</h5>
          <span className="me-3 small text-muted">
            {Moment(comment?.date, i18n.language)}
          </span>
        </div>
        <button
          onClick={() => handleReply(comment.id, comment.name)}
          className="btn btn-sm btn-link text-decoration-none small"
        >
          <i className="fas fa-reply me-1"></i>{" "}
          {t("detail.reply", { defaultValue: "Reply" })}
        </button>
      </div>
      <p className="fw-bold mb-2">{comment?.comment}</p>

      {/* Nested Replies */}
      {comment.reply_set && comment.reply_set.length > 0 && (
        <div className="mt-3">
          {comment.reply_set.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              t={t}
              i18n={i18n}
              handleReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function Detail() {
  const { t, i18n } = useTranslation();
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
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (translating) return;
    setTranslating(true);
    try {
      const targetLang = i18n.language === "vi" ? "Vietnamese" : "English";
      const prompt = `Translate the following blog post to ${targetLang}. Return ONLY a valid JSON object with keys "title" and "description". Do not include Markdown formatting (no \`\`\`json). \n\nOriginal Title: ${post.title}\nOriginal Description: ${post.description}`;

      const response = await apiInstance.post("content/generate/", {
        prompt: prompt,
        type: "text",
      });

      let content = response.data.content;
      content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const translated = JSON.parse(content);
      setPost((prev) => ({
        ...prev,
        title: translated.title,
        description: translated.description,
      }));
      Toast(
        "success",
        i18n.language === "vi" ? "Dịch thành công!" : "Translated successfully!"
      );
    } catch (error) {
      console.error("Translation error", error);
      Toast(
        "error",
        i18n.language === "vi" ? "Dịch thất bại" : "Translation failed"
      );
    } finally {
      setTranslating(false);
    }
  };

  const tSafe = (key, valVi, valEn) => {
    const tVal = t(key);
    if (tVal !== key) return tVal;
    return i18n.language === "vi" ? valVi : valEn;
  };

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
      `ws://localhost:8002/ws/posts/${post.id}/comments/`
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

  // Reading Progress Logic
  const [readingProgress, setReadingProgress] = useState(0);
  const [showAiChat, setShowAiChat] = useState(false);

  const scrollListener = () => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setReadingProgress(progress);
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, []);

  const handleReply = (commentId, name) => {
    setCreateComment({
      ...createComment,
      parent: commentId,
      comment: `@${name} `,
    });
    // Scroll to comment form
    const form = document.querySelector("form");
    if (form) form.scrollIntoView({ behavior: "smooth" });
  };

  // ... (CommentItem removed from here)

  const handleCreateCommentSubmit = async (event) => {
    event.preventDefault();

    const json = {
      post_id: post?.id,
      name: createComment.full_name,
      email: createComment.email,
      comment: createComment.comment,
      parent: createComment.parent || null, // Send parent ID
    };

    try {
      await apiInstance.post("post/comment-post/", json);
      Toast("success", t("detail.commentPosted"));

      setCreateComment({
        full_name: "",
        email: "",
        comment: "",
        parent: null,
      });
      fetchPost(commentSortOrder); // Refresh to show new comment
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
      // Determine message based on backend response
      const message = response.data.message;
      let toastMessage = message;
      if (
        message.includes("Unliked") ||
        message.includes("unliked") ||
        message.includes("Disliked")
      ) {
        toastMessage = tSafe(
          "detail.postUnliked",
          "Đã bỏ thích bài viết",
          "Post unliked successfully"
        );
      } else if (message.includes("Liked") || message.includes("liked")) {
        toastMessage = tSafe(
          "detail.postLiked",
          "Đã thích bài viết",
          "Post liked successfully"
        );
      }
      Toast("success", toastMessage);

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
      const message = response.data.message;
      let toastMessage = message;
      if (message.includes("Un") || message.includes("Remove")) {
        toastMessage = tSafe(
          "detail.postUnbookmarked",
          "Đã bỏ lưu bài viết",
          "Post unbookmarked successfully"
        );
      } else if (
        message.includes("Bookmarked") ||
        message.includes("bookmarked")
      ) {
        toastMessage = tSafe(
          "detail.postBookmarked",
          "Đã lưu bài viết",
          "Post bookmarked successfully"
        );
      }
      Toast("success", toastMessage);
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
      {/* Reading Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4px",
          background: "linear-gradient(to right, #4f46e5, #0ea5e9)",
          width: `${readingProgress}%`,
          zIndex: 9999,
          transition: "width 0.1s",
        }}
      ></div>

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
              <div className="text-center mt-3">
                <button
                  onClick={handleTranslate}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  disabled={translating}
                >
                  {translating ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      {t("detail.translating", {
                        defaultValue: "Translating...",
                      })}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-language me-2"></i>
                      {t("detail.translate_content", {
                        defaultValue: "Translate Content",
                      })}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-0 mb-5">
        <div className="container position-relative" data-sticky-container="">
          <div className="row">
            <div className="col-lg-3">
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
                  <li className="list-inline-item d-lg-flex align-items-center my-lg-2 text-start">
                    <div
                      className="d-inline-flex justify-content-center align-items-center me-2"
                      style={{ width: "30px" }}
                    >
                      <i className="fas fa-calendar fa-fw"></i>
                    </div>
                    {Moment(post?.date, i18n.language)}
                  </li>
                  <li className="list-inline-item d-lg-flex align-items-center my-lg-2 text-start">
                    <div
                      className="d-inline-flex justify-content-center align-items-center me-2"
                      style={{ width: "30px" }}
                    >
                      <i className="fas fa-heart fa-fw" />
                    </div>
                    <span>
                      {post?.likes?.length} {t("detail.likes")}
                    </span>
                  </li>
                  <li className="list-inline-item d-lg-flex align-items-center my-lg-2 text-start">
                    <div
                      className="d-inline-flex justify-content-center align-items-center me-2"
                      style={{ width: "30px" }}
                    >
                      <i className="fas fa-eye fa-fw" />
                    </div>
                    {post?.view} {t("detail.views")}
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

                {/* AI Assistant Trigger Button */}
                <button
                  onClick={() => setShowAiChat(!showAiChat)}
                  className="btn btn-ai-trigger ms-2"
                  title={t("detail.ask_ai", { defaultValue: "Ask AI" })}
                >
                  <i className="fas fa-wand-magic-sparkles text-white"></i>
                </button>
              </div>
            </div>
            {/* Left sidebar END */}
            {/* Main Content START */}
            <div className="col-lg-9 mb-5">
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
                <>
                  <style>
                    {`
                      /* Default (Light Mode) */
                      .ai-summary-box {
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
                        border: 1px solid #bae6fd;
                        color: #1e293b;
                      }
                      .ai-summary-box h5 {
                        color: #4f46e5; /* Primary color */
                      }

                      /* Dark Mode Overrides */
                      body.dark-theme .ai-summary-box {
                        background: #1f2937 !important;
                        border: 1px solid #374151 !important;
                        color: #e5e7eb !important;
                      }
                      body.dark-theme .ai-summary-box h5 {
                        color: #60a5fa !important; /* Light blue for title */
                      }
                      body.dark-theme .expect-white-icons i {
                        color: #f1f5f9 !important;
                      }
                    `}
                  </style>
                  <div className="border-0 ai-summary-box shadow-sm rounded-3 p-4 my-4">
                    <h5 className="fw-bold mb-3 d-flex align-items-center">
                      <span style={{ fontSize: "24px", marginRight: "10px" }}>
                        ✨
                      </span>
                      {t("detail.aiSummary") !== "detail.aiSummary"
                        ? t("detail.aiSummary")
                        : i18n.language === "vi"
                          ? "Tóm tắt AI"
                          : "AI Summary"}
                    </h5>
                    <p
                      className="mb-0"
                      style={{ lineHeight: "1.6", fontSize: "1.05rem" }}
                    >
                      {post.ai_summary.summarized_content}
                    </p>
                  </div>
                </>
              )}

              <hr />
              {/* AIChatAssistant moved to floating panel */}
              {/* <AIChatAssistant /> */}
              <div className="d-flex py-4">
                <div>
                  <ul className="nav expect-white-icons">
                    <li className="nav-item">
                      <a
                        className="nav-link ps-0 pe-2 fs-5"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      >
                        <i className="fab fa-facebook-square" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link px-2 fs-5"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                      >
                        <i className="fa-brands fa-square-x-twitter" />
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link px-2 fs-5"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
                      >
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
                {/* Render Recursive Comments */}
                {allComments?.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    t={t}
                    i18n={i18n}
                    handleReply={handleReply}
                  />
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
                {createComment.parent && (
                  <div className="alert alert-info py-2 d-flex justify-content-between align-items-center">
                    <small>
                      Replying to {createComment.comment.split(" ")[0]}...
                    </small>
                    <button
                      className="btn btn-sm btn-close"
                      onClick={() =>
                        setCreateComment({
                          ...createComment,
                          parent: null,
                          comment: "",
                        })
                      }
                    ></button>
                  </div>
                )}
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

      {/* AI Assistant Side Panel */}
      <div
        style={{
          position: "fixed",
          top: "80px", // Below header
          left: showAiChat ? "0" : "-400px",
          width: "350px",
          height: "calc(100vh - 80px)",
          backgroundColor: "white",
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
          transition: "left 0.3s ease-in-out",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
        }}
        className="ai-side-panel" // We will add dark mode styles for this class in index.css
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h5 className="m-0 fw-bold d-flex align-items-center text-primary">
            <span className="me-2">✨</span> AI Assistant
          </h5>
          <button
            onClick={() => setShowAiChat(false)}
            className="btn-close"
          ></button>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AIChatAssistant contextString={post.description} />
        </div>
      </div>
    </>
  );
}

export default Detail;
