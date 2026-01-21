import React, { useState, useEffect, useCallback } from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";
import AIChatAssistant from "../partials/AIChatAssistant";
import TagInput from "../partials/TagInput";
import { useAIService } from "../../utils/useAIService";

const Quill = ReactQuill.Quill;
const Font = Quill.import("formats/font");
Font.whitelist = [
  "roboto",
  "open-sans",
  "lato",
  "montserrat",
  "merriweather",
  "inconsolata",
  "outfit",
  "sans-serif",
  "serif",
  "monospace",
];
Quill.register(Font, true);

function EditPost() {
  const [post, setEditPost] = useState({
    image: "",
    title: "",
    category: "",
    description: "",
    tags: "",
    status: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { generateContent } = useAIService();

  const userData = useUserData();
  const userId = userData?.userId;
  const navigate = useNavigate();
  const param = useParams();

  const fetchPost = useCallback(async () => {
    try {
      const response = await apiInstance.get(
        `author/dashboard/post-detail/${userId}/${param?.id}/`,
      );
      console.log(response.data);
      setEditPost(response.data);
    } catch (error) {
      console.error("Failed to fetch post:", error);
    }
  }, [userId, param.id]);

  const fetchCategory = async () => {
    try {
      const response = await apiInstance.get(`post/category/list/`);
      setCategoryList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategory();
    if (userId && param.id) {
      fetchPost();
    }
  }, [fetchPost, userId, param.id]);

  const handleCreatePostChange = (event) => {
    setEditPost({
      ...post,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setEditPost({
        ...post,
        image: {
          file: selectedFile,
          preview: reader.result,
        },
      });
      setImagePreview(reader.result);
    };
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userId = userData?.userId;

    if (!userId) {
      Toast("error", t("editPost.userIdMissing"));
      setIsLoading(false);
      return;
    }

    if (
      !post.title ||
      !post.description ||
      !post.image ||
      !post.category ||
      !post.status
    ) {
      Toast("error", t("editPost.fillAllFields"));
      setIsLoading(false);
      return;
    }

    if (!post.title || !post.description || !post.image) {
      Toast("error", t("editPost.allFieldsRequired"));
      setIsLoading(false);
      return;
    }

    const formdata = new FormData();

    formdata.append("user_id", userId);
    formdata.append("title", post.title);
    if (post.image.file) {
      formdata.append("image", post.image.file);
    }
    formdata.append("description", post.description);
    formdata.append("tags", post.tags);
    formdata.append("category", post.category);
    formdata.append("post_status", post.status);

    try {
      const response = await apiInstance.patch(
        `author/dashboard/post-detail/${userId}/${param?.id}/`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log(response.data);
      setIsLoading(false);
      Swal.fire({
        title: t("editPost.postUpdatedSuccess"),
        icon: "success",
      });
      navigate("/posts/");
    } catch (error) {
      console.error(error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: Font.whitelist }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "link",
    "image",
    "video",
    "align",
  ];

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              <>
                <section className="py-4 py-lg-6 bg-primary rounded-3">
                  <div className="container">
                    <div className="row">
                      <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                        <div className="d-lg-flex align-items-center justify-content-between">
                          <div className="mb-4 mb-lg-0">
                            <h1 className="text-white mb-1">
                              {t("editPost.editPost")}
                            </h1>
                            <p className="mb-0 text-white lead">
                              {t("editPost.useBuilder")}
                            </p>
                          </div>
                          <div>
                            <Link
                              to="/posts/"
                              className="btn"
                              style={{ backgroundColor: "white" }}
                            >
                              {" "}
                              <i className="fas fa-arrow-left"></i>{" "}
                              {t("editPost.backToPosts")}
                            </Link>
                            <a
                              href="instructor-posts.html"
                              className="btn btn-dark ms-2 d-none"
                            >
                              {t("editPost.saveChanges")}{" "}
                              <i className="fas fa-check-circle"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <form onSubmit={handleCreatePost} className="pb-8 mt-5">
                  <div className="card mb-3">
                    {/* Basic Info Section */}
                    <div className="card-header border-bottom px-4 py-3">
                      <h4 className="mb-0">{t("editPost.basicInfo")}</h4>
                    </div>
                    <div className="card-body">
                      <label htmlFor="postTHumbnail" className="form-label">
                        {t("editPost.preview")}
                      </label>
                      <img
                        style={{
                          width: "100%",
                          height: "330px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                        className="mb-4"
                        src={
                          imagePreview ||
                          post?.image ||
                          "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                        }
                        alt=""
                      />
                      <div className="mb-3">
                        <label htmlFor="postTHumbnail" className="form-label">
                          {t("editPost.thumbnail")}
                        </label>
                        <input
                          onChange={handleFileChange}
                          name="file"
                          id="postTHumbnail"
                          className="form-control"
                          type="file"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          {t("editPost.title")}
                        </label>
                        <input
                          onChange={handleCreatePostChange}
                          value={post?.title || ""}
                          name="title"
                          className="form-control"
                          type="text"
                          placeholder=""
                        />
                        <small>{t("editPost.titleHelp")}</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          {t("editPost.category")}
                        </label>
                        <select
                          className="form-select"
                          onChange={handleCreatePostChange}
                          name="category"
                          value={post?.category?.id || post?.category || ""}
                        >
                          <option value="">-------------</option>
                          {categoryList?.map((c, index) => (
                            <option key={index} value={c?.id}>
                              {t(
                                `category.${c?.title?.toLowerCase()}`,
                                c?.title,
                              )}
                            </option>
                          ))}
                        </select>
                        <small>{t("editPost.categoryHelp")}</small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          {t("editPost.description")}
                        </label>
                        <AIChatAssistant
                          imageContext={imagePreview || post.image}
                        />
                        <ReactQuill
                          theme="snow"
                          value={post?.description || ""}
                          onChange={(value) =>
                            setEditPost({ ...post, description: value })
                          }
                          modules={modules}
                          formats={formats}
                        />
                        <div className="d-flex gap-2 mt-2">
                          <button
                            type="button"
                            disabled={isLoading}
                            className="btn btn-sm btn-outline-primary rounded-pill"
                            onClick={async () => {
                              if (!post.description) {
                                Toast(
                                  "error",
                                  t("addPost.enterTextFirst") ||
                                    "Please enter text",
                                );
                                return;
                              }
                              setIsLoading(true);
                              try {
                                const langText =
                                  t("common.currentLanguageName", {
                                    defaultValue: "English",
                                  }) || "English";
                                const prompt = `Rewrite the following text to be more professional and engaging in ${langText} (Return ONLY the rewritten HTML content, keep formatting):`;
                                const result = await generateContent(
                                  prompt,
                                  "text",
                                  post.description,
                                );

                                if (result && result.content) {
                                  setEditPost({
                                    ...post,
                                    description: result.content,
                                  });
                                  Toast(
                                    "success",
                                    t("addPost.contentRewritten", {
                                      defaultValue:
                                        "Content rewritten successfully!",
                                    }),
                                  );
                                }
                              } catch (error) {
                                Toast("error", "AI Error: " + error.message);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            <i className="fas fa-magic me-1"></i>{" "}
                            {t("addPost.rewrite") || "Rewrite with AI"}
                          </button>
                          <small className="text-muted ms-auto">
                            {t("addPost.useAiHint")}
                          </small>
                        </div>
                        <small>{t("editPost.descriptionHelp")}</small>
                      </div>
                      <div>
                        <label htmlFor="" className="form-label">
                          {t("editPost.status")}
                        </label>
                        <select
                          value={post?.status || ""}
                          className="form-select"
                          name="status"
                          id=""
                          onChange={handleCreatePostChange}
                        >
                          <option value="Active">
                            {t("status.active", "Active")}
                          </option>
                          <option value="Draft">
                            {t("status.draft", "Draft")}
                          </option>
                          <option value="Disabled">
                            {t("status.disabled", "Disabled")}
                          </option>
                        </select>
                      </div>
                      <label className="form-label">{t("editPost.tag")}</label>
                      <TagInput
                        value={post?.tags || ""}
                        onChange={(newTags) =>
                          setEditPost({ ...post, tags: newTags })
                        }
                      />
                    </div>
                  </div>
                  {isLoading === true ? (
                    <>
                      <button
                        disabled
                        className="btn btn-lg btn-secondary w-100 mt-2"
                        type="submit"
                      >
                        {t("editPost.savingPost")}{" "}
                        <i className="fas fa-spinner fa-spin"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-lg btn-success w-100 mt-2"
                        type="submit"
                      >
                        {t("editPost.saveChanges")}{" "}
                        <i className="fas fa-check-circle"></i>
                      </button>
                    </>
                  )}
                </form>
              </>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default EditPost;
