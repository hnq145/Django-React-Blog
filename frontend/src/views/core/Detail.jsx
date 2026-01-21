import React, { useEffect, useState, useCallback } from "react";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "../../store/auth";
import { useImageContext } from "../../context/ImageContext";

const baseURL = apiInstance.defaults.baseURL.replace("/api/v1", "");

const CommentItem = ({ comment, t, i18n, handleReply, postAuthorEmail }) => {
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTranslateComment = async () => {
    if (translatedText) {
      setIsTranslated(!isTranslated);
      return;
    }

    setIsTranslating(true);
    try {
      const targetLang = i18n.language === "vi" ? "Vietnamese" : "English";
      const prompt = `Translate the following comment to ${targetLang}. Return ONLY the translated text. Original: ${comment.comment}`;

      const response = await apiInstance.post("content/generate/", {
        prompt: prompt,
        type: "text",
      });

      setTranslatedText(response.data.content);
      setIsTranslated(true);
    } catch (error) {
      console.error("Translation error", error);
      Toast(
        "error",
        i18n.language === "vi" ? "Dịch thất bại" : "Translation failed",
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const isAuthor = postAuthorEmail && comment.email === postAuthorEmail;

  return (
    <div
      className={`d-flex ${comment.parent ? "ms-5 border-start ps-3" : ""} bg-light p-3 mb-3 rounded`}
    >
      {/* Avatar Column */}
      <div className="flex-shrink-0 me-3">
        <img
          className="rounded-circle"
          src={
            comment.profile_image
              ? comment.profile_image
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  comment.name || "User",
                )}&background=random&color=fff&size=128`
          }
          alt={comment.name}
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
          title={comment.name} // Simple tooltip
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              comment.name || "User",
            )}&background=random&color=fff&size=128`;
          }}
        />
      </div>

      {/* Content Column */}
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between">
          <div className="mb-2">
            <h5 className="m-0 d-flex align-items-center">
              {comment?.name}
              {isAuthor && (
                <span
                  className="badge bg-primary ms-2"
                  style={{ fontSize: "0.65rem", padding: "0.35em 0.65em" }}
                  title="Author"
                >
                  <i className="fas fa-pen-nib me-1"></i>
                  {t("detail.author", "Tác giả")}
                </span>
              )}
              {comment?.badges?.map((badge, idx) => (
                <span
                  key={idx}
                  className="badge bg-secondary ms-1"
                  style={{ fontSize: "0.65rem", padding: "0.35em 0.65em" }}
                  title={badge.description || badge.name}
                >
                  {badge.icon && badge.icon.startsWith("fa") ? (
                    <i className={`${badge.icon} me-1`}></i>
                  ) : null}
                  {badge.name}
                </span>
              ))}
            </h5>
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

        <div className={`fw-bold mb-2 ${isExpanded ? "" : "line-clamp-5"}`}>
          {isTranslated ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {translatedText}
            </ReactMarkdown>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comment?.comment}
            </ReactMarkdown>
          )}
        </div>
        {((isTranslated && translatedText?.length > 300) ||
          (!isTranslated && comment?.comment?.length > 300)) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-link p-0 mb-2 text-decoration-none small"
            style={{ fontSize: "0.9rem" }}
          >
            {isExpanded
              ? t("dashboard.showLess", "Rút gọn")
              : t("dashboard.showMore", "Xem thêm")}
          </button>
        )}

        {/* Translation Button */}
        <button
          onClick={handleTranslateComment}
          className="btn btn-sm btn-link text-decoration-none p-0 mb-2 text-start"
          style={{ fontSize: "0.85rem", color: "#6c757d" }}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <span>
              <i className="fas fa-spinner fa-spin me-1"></i>{" "}
              {t("detail.translating", "Translating...")}
            </span>
          ) : isTranslated ? (
            t("detail.seeOriginal", "See Original")
          ) : (
            t("detail.seeTranslation", "See Translation")
          )}
        </button>

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
                postAuthorEmail={postAuthorEmail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function Detail() {
  const { t, i18n } = useTranslation();
  const { openImageViewer } = useImageContext();
  const [post, setPost] = useState(null);
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

  // Mention State
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  // Post Translation State
  const [translating, setTranslating] = useState(false);
  const [translatedPost, setTranslatedPost] = useState(null);
  const [showTranslated, setShowTranslated] = useState(false);

  const displayPost = showTranslated && translatedPost ? translatedPost : post;

  const handleTranslate = async () => {
    if (translatedPost) {
      setShowTranslated(!showTranslated);
      return;
    }

    setTranslating(true);
    try {
      const targetLang = i18n.language === "vi" ? "Vietnamese" : "English";
      const prompt = `Translate the following blog post to ${targetLang}. Preserve all HTML tags and structure in the description. Return ONLY a valid JSON object with keys "title" and "description". Do not include Markdown formatting (no \`\`\`json). \n\nOriginal Title: ${post.title}\nOriginal Description: ${post.description}`;

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
      setTranslatedPost({
        ...post,
        title: translated.title,
        description: translated.description,
      });
      setShowTranslated(true);

      Toast(
        "success",
        i18n.language === "vi"
          ? "Dịch thành công!"
          : "Translated successfully!",
      );
    } catch (error) {
      console.error("Translation error", error);
      Toast(
        "error",
        i18n.language === "vi" ? "Dịch thất bại" : "Translation failed",
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
          `post/detail/${param.slug}/?comment_sort=${sortOrder}&page=${page}`,
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
    [param.slug],
  );

  useEffect(() => {
    fetchPost(commentSortOrder);
  }, [fetchPost, commentSortOrder]);

  useEffect(() => {
    if (!post?.id) return;

    const commentSocket = new WebSocket(
      `ws://localhost:8000/ws/posts/${post.id}/comments/`,
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
  }, [post?.id, commentSortOrder, fetchPost]);

  const fetchUserSuggestions = useCallback(async (query) => {
    if (!query) {
      setMentionSuggestions([]);
      return;
    }
    try {
      const response = await apiInstance.get(`user/search/?q=${query}`);
      setMentionSuggestions(response.data);
      setShowMentionList(true);
    } catch (error) {
      console.error("Error searching users", error);
    }
  }, []);

  useEffect(() => {
    if (mentionQuery) {
      const timer = setTimeout(() => {
        fetchUserSuggestions(mentionQuery);
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    } else {
      setShowMentionList(false);
    }
  }, [mentionQuery, fetchUserSuggestions]);

  const handleCreateCommentChange = (event) => {
    const { name, value } = event.target;
    setCreateComment({
      ...createComment,
      [name]: value,
    });

    if (name === "comment") {
      const cursor = event.target.selectionStart;
      setCursorPosition(cursor);

      // Check for @ mention trigger
      // Look for @ symbol before cursor
      const textBeforeCursor = value.slice(0, cursor);
      const lastAtPos = textBeforeCursor.lastIndexOf("@");

      if (lastAtPos !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
        // Only trigger if no spaces in between (simple validation)
        if (!textAfterAt.includes(" ")) {
          setMentionQuery(textAfterAt);
          return;
        }
      }
      setShowMentionList(false);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (username) => {
    const value = createComment.comment;
    const textBeforeAt = value.slice(
      0,
      value.lastIndexOf("@", cursorPosition - 1),
    );
    const textAfterCursor = value.slice(cursorPosition);
    const newValue = `${textBeforeAt}@${username} ${textAfterCursor}`;

    setCreateComment({
      ...createComment,
      comment: newValue,
    });
    setShowMentionList(false);
    setMentionQuery("");
    // Optional: focus back to textarea logic here if ref is used
  };

  // Reading Progress Logic
  const [readingProgress, setReadingProgress] = useState(0);
  const [showAiChat, setShowAiChat] = useState(false);
  const replyFormRef = React.useRef(null);

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
    // Scroll to reply form
    if (replyFormRef.current) {
      replyFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Optional: Focus textarea
      const textarea = replyFormRef.current.querySelector("textarea");
      if (textarea) textarea.focus();
    }
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

  const handleReaction = async (type = "Like") => {
    try {
      const response = await apiInstance.post(`post/like-post/`, {
        post_id: post?.id,
        reaction_type: type,
        // user_id is optional if authenticated, backend prefers auth user
      });

      const message = response.data.message;
      let toastType = "success";
      let translatedMessage = t("detail.postLiked", "Post Liked");

      const oldReaction = post.my_reaction;
      const newReaction = type;
      let newMyReaction = newReaction;
      let newCounts = { ...post.reaction_counts };

      if (message.includes("Removed") || message.includes("Unliked")) {
        toastType = "info";
        translatedMessage = t("detail.postUnliked", "Post Unliked");
        newMyReaction = null;
        if (oldReaction && newCounts[oldReaction] > 0) {
          newCounts[oldReaction] -= 1;
        }
      } else {
        // Added or Changed
        if (oldReaction && oldReaction !== newReaction) {
          if (newCounts[oldReaction] > 0) newCounts[oldReaction] -= 1;
        }
        if (!oldReaction || oldReaction !== newReaction) {
          newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
        }
      }

      Toast(toastType, translatedMessage);

      // Update state locally without refetching to preserve Follow status and improved UX
      setPost((prev) => ({
        ...prev,
        my_reaction: newMyReaction,
        reaction_counts: newCounts,
      }));
    } catch (error) {
      console.error("Error reacting to post:", error);
      Toast("error", "Failed to react");
    }
  };

  // Helper to get reaction icon
  const getReactionIcon = (type) => {
    switch (type) {
      case "Like":
        return "👍";
      case "Love":
        return "❤️";
      case "Haha":
        return "😂";
      case "Wow":
        return "😮";
      case "Sad":
        return "😢";
      case "Angry":
        return "😡";
      default:
        return <i className="fas fa-thumbs-up"></i>;
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
          "Post unbookmarked successfully",
        );
      } else if (
        message.includes("Bookmarked") ||
        message.includes("bookmarked")
      ) {
        toastMessage = tSafe(
          "detail.postBookmarked",
          "Đã lưu bài viết",
          "Post bookmarked successfully",
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

  if (!post) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <a
                href="#"
                className="badge bg-primary mb-2 text-decoration-none"
              >
                {post.category?.title || post.category?.name
                  ? t(
                      `category.${(
                        post.category?.title ||
                        post.category?.name ||
                        ""
                      ).toLowerCase()}`,
                      post.category?.title || post.category?.name,
                    )
                  : t("category.uncategorized", "Chưa phân loại")}
              </a>
              <h1 className="text-center">{displayPost.title}</h1>
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
                  ) : showTranslated ? (
                    <>
                      <i className="fas fa-undo me-2"></i>
                      {t("detail.seeOriginal", {
                        defaultValue: "See Original",
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
                  <div className="avatar avatar-xl">
                    <img
                      className="avatar-img"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      src={
                        post?.profile?.image &&
                        !post?.profile?.image.includes("default-user")
                          ? post?.profile?.image?.startsWith("http")
                            ? post?.profile?.image
                            : `${baseURL}${post?.profile?.image}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              post?.user?.full_name ||
                                post?.user?.username ||
                                "User",
                            )}&background=random&color=fff&size=128`
                      }
                      alt="avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          post?.user?.full_name ||
                            post?.user?.username ||
                            "User",
                        )}&background=random&color=fff&size=128`;
                      }}
                      onClick={() =>
                        openImageViewer(
                          post?.profile?.image &&
                            !post?.profile?.image.includes("default-user")
                            ? post?.profile?.image?.startsWith("http")
                              ? post?.profile?.image
                              : `${baseURL}${post?.profile?.image}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.user?.full_name || post?.user?.username || "User")}&background=random&color=fff&size=128`,
                        )
                      }
                    />
                  </div>
                  <a
                    href="#"
                    className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block"
                  >
                    {post?.user?.full_name || post?.user?.username}
                  </a>

                  {/* Follow Button */}
                  {post?.user?.id &&
                    String(useAuthStore.getState().user?.user_id) !==
                      String(post.user.id) && (
                      <button
                        className={`btn btn-sm mt-2 rounded-pill px-3 ${post?.is_following ? "btn-outline-danger" : "btn-primary"}`}
                        onClick={async () => {
                          try {
                            await apiInstance.post(`user/follow/`, {
                              user_id: post?.user?.id,
                            });
                            const newStatus = !post?.is_following;
                            Toast(
                              "success",
                              newStatus
                                ? t("notification.followed_you", "Followed")
                                : t("profile.unfollow", "Unfollowed"),
                            );
                            // Optimistic Update or Refresh
                            fetchPost(commentSortOrder);
                          } catch (error) {
                            console.error(error);
                            Toast("error", "Error updating follow status");
                          }
                        }}
                      >
                        {post?.is_following ? (
                          <>
                            <i className="fas fa-user-minus me-1"></i>{" "}
                            {t("profile.unfollow", "Unfollow")}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-1"></i>{" "}
                            {t("notification.followed_you", "Follow")}
                          </>
                        )}
                      </button>
                    )}

                  <p>{post?.profile?.bio || ""}</p>
                </div>

                <hr />
                <ul className="list-inline list-unstyled text-center">
                  <li className="list-inline-item d-lg-flex align-items-center my-lg-2 text-start">
                    <div
                      className="d-inline-flex justify-content-center align-items-center me-2"
                      style={{ width: "30px" }}
                    >
                      <i className="fas fa-calendar-alt fa-fw" />
                    </div>
                    {Moment(post.date, i18n.language)}
                  </li>
                  <li className="list-inline-item d-lg-flex align-items-center my-lg-2 text-start">
                    <div
                      className="d-inline-flex justify-content-center align-items-center me-2"
                      style={{ width: "30px" }}
                    >
                      <i className="fas fa-heart fa-fw" />
                    </div>
                    <span>
                      {post.likes?.length || 0} {t("detail.likes")}
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

                {/* Rich Reaction UI */}
                <style>
                  {`
                    .reaction-container { position: relative; display: inline-block; }
                    .reaction-popup {
                      display: none;
                      position: absolute;
                      bottom: 100%;
                      left: 50%;
                      transform: translateX(-50%);
                      background: white;
                      padding: 5px 10px;
                      border-radius: 50px;
                      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                      margin-bottom: 10px;
                      white-space: nowrap;
                      z-index: 10;
                      animation: popUp 0.3s ease forwards;
                    }
                    .reaction-container:hover .reaction-popup { display: flex; gap: 5px; }
                    .reaction-btn {
                      font-size: 1.5rem;
                      cursor: pointer;
                      transition: transform 0.2s;
                      background: none;
                      border: none;
                      padding: 0 5px;
                    }
                    .reaction-btn:hover { transform: scale(1.3); }
                    @keyframes popUp {
                      from { opacity: 0; transform: translate(-50%, 10px); }
                      to { opacity: 1; transform: translate(-50%, 0); }
                    }
                    /* Invisible bridge to prevent losing hover */
                    .reaction-popup::after {
                      content: '';
                      position: absolute;
                      top: 100%;
                      left: 0;
                      width: 100%;
                      height: 15px; 
                    }
                  `}
                </style>
                <div className="reaction-container">
                  <div className="reaction-popup">
                    <button
                      onClick={() => handleReaction("Like")}
                      className="reaction-btn"
                      title="Like"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleReaction("Love")}
                      className="reaction-btn"
                      title="Love"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handleReaction("Haha")}
                      className="reaction-btn"
                      title="Haha"
                    >
                      😂
                    </button>
                    <button
                      onClick={() => handleReaction("Wow")}
                      className="reaction-btn"
                      title="Wow"
                    >
                      😮
                    </button>
                    <button
                      onClick={() => handleReaction("Sad")}
                      className="reaction-btn"
                      title="Sad"
                    >
                      😢
                    </button>
                    <button
                      onClick={() => handleReaction("Angry")}
                      className="reaction-btn"
                      title="Angry"
                    >
                      😡
                    </button>
                  </div>

                  <button
                    onClick={() => handleReaction(post?.my_reaction || "Like")}
                    className={`btn ${post?.my_reaction ? "btn-light border" : "btn-primary"}`}
                  >
                    {post?.my_reaction ? (
                      <span className="me-2" style={{ fontSize: "1.2rem" }}>
                        {getReactionIcon(post.my_reaction)}
                      </span>
                    ) : (
                      <i className="fas fa-thumbs-up me-2"></i>
                    )}

                    {post?.reaction_counts
                      ? Object.values(post.reaction_counts).reduce(
                          (a, b) => a + b,
                          0,
                        )
                      : post?.likes?.length || 0}
                  </button>
                </div>

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
                    alt={displayPost.title}
                    className="img-fluid rounded"
                    style={{ cursor: "pointer" }}
                    onClick={() => openImageViewer(post.image)}
                  />
                </div>
              )}
              {/* Render HTML Content from Quill */}
              <div
                className="content-body"
                style={{ fontSize: "1.1rem", lineHeight: "1.8" }}
                dangerouslySetInnerHTML={{ __html: displayPost.description }}
                onClick={(e) => {
                  if (e.target.tagName === "IMG") {
                    openImageViewer(e.target.src);
                  }
                }}
              />

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
                    postAuthorEmail={post?.user?.email}
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
                                commentPagination.previous,
                              ).searchParams.get("page"),
                            )
                          }
                        >
                          {t("pagination.previous")}
                        </button>
                      </li>
                    )}

                    {Array.from(
                      { length: Math.ceil(commentPagination.count / 10) },
                      (_, i) => i + 1,
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
                                "page",
                              ),
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
                      {t("detail.replyingTo", "Replying to")}{" "}
                      {createComment.comment.split(" ")[0]}...
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
                  ref={replyFormRef}
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
                  <div className="col-12 position-relative">
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

                    {/* Mention Suggestions List */}
                    {showMentionList && mentionSuggestions.length > 0 && (
                      <div
                        className="card position-absolute shadow-lg"
                        style={{
                          bottom: "100%",
                          left: "0",
                          width: "250px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 1000,
                        }}
                      >
                        <ul className="list-group list-group-flush">
                          {mentionSuggestions.map((user) => (
                            <li
                              key={user.id}
                              className="list-group-item list-group-item-action cursor-pointer d-flex align-items-center"
                              onClick={() => handleMentionSelect(user.username)}
                              style={{ cursor: "pointer" }}
                            >
                              <img
                                src={
                                  user.profile?.image ||
                                  "https://ui-avatars.com/api/?name=" +
                                    user.username
                                }
                                alt={user.username}
                                className="rounded-circle me-2"
                                width="30"
                                height="30"
                              />
                              <div>
                                <small className="fw-bold d-block">
                                  {user.full_name || user.username}
                                </small>
                                <small className="text-muted">
                                  @{user.username}
                                </small>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
