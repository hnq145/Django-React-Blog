import { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";
import AIChatAssistant from "../partials/AIChatAssistant";
import { useTranslation } from "react-i18next";
import { useAIService } from "../../utils/useAIService";

function AddPost() {
  const [post, setCreatePost] = useState({
    image: "",
    title: "",
    description: "",
    category: "",
    tags: "",
    status: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { generateContent } = useAIService();
  const userData = useUserData();
  const userId = userData?.user_id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchCategory = async () => {
    const response = await apiInstance.get(`post/category/list/`);
    setCategoryList(response.data);
    console.log(response.data);
  };
  useEffect(() => {
    fetchCategory();
  }, []);

  const handleCreatePostChange = (event) => {
    setCreatePost({
      ...post,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setCreatePost({
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

  console.log(post.image.file);

  const handleCreatePost = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (!userId) {
      Toast("error", t("addPost.notAuthenticated"));
      setIsLoading(false);
      return;
    }

    if (!post.title || !post.description || !post.image) {
      Toast("error", t("addPost.allFieldsRequired"));
      setIsLoading(false);
      return;
    }

    if (!post.status) {
      Toast("error", t("addPost.selectStatus"));
      setIsLoading(false);
      return;
    }

    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("title", post.title);
    formdata.append("image", post.image.file);
    formdata.append("description", post.description);
    formdata.append("tags", post.tags);
    formdata.append("category", parseInt(post.category));
    formdata.append("post_status", post.status);

    try {
      const response = await apiInstance.post(
        "author/dashboard/post-create/",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: t("addPost.postCreatedSuccess"),
      });
      navigate("/posts/");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Toast(
        "error",
        error.response?.data?.detail || t("addPost.errorCreating")
      );
    }
  };

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
                              {t("addPost.createPost")}
                            </h1>
                            <p className="mb-0 text-white lead">
                              {t("addPost.useBuilder")}
                            </p>
                          </div>
                          <div>
                            <Link
                              to="/instructor/posts/"
                              className="btn"
                              style={{ backgroundColor: "white" }}
                            >
                              {" "}
                              <i className="fas fa-arrow-left"></i>{" "}
                              {t("addPost.backToPosts")}
                            </Link>
                            <a
                              href="instructor-posts.html"
                              className="btn btn-dark ms-2"
                            >
                              {t("addPost.saveChanges")}{" "}
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
                      <h4 className="mb-0">{t("addPost.basicInfo")}</h4>
                    </div>
                    <div className="card-body">
                      <label htmlFor="postTHumbnail" className="form-label">
                        {t("addPost.preview")}
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
                          "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                        }
                        alt=""
                      />
                      <div className="mb-3">
                        <label htmlFor="postTHumbnail" className="form-label">
                          {t("addPost.thumbnail")}
                        </label>
                        <input
                          onChange={handleFileChange}
                          name="image"
                          id="postTHumbnail"
                          className="form-control"
                          type="file"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          {t("addPost.title")}
                        </label>
                        <input
                          onChange={handleCreatePostChange}
                          name="title"
                          className="form-control"
                          type="text"
                          placeholder=""
                        />
                        <small>{t("addPost.titleHelp")}</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          {t("addPost.category")}
                        </label>
                        <select
                          name="category"
                          onChange={handleCreatePostChange}
                          className="form-select"
                        >
                          <option value="">-------------</option>
                          {categoryList?.map((c) => (
                            <option key={c?.id} value={c?.id}>
                              {c?.title}
                            </option>
                          ))}
                        </select>
                        <small>{t("addPost.categoryHelp")}</small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          {t("addPost.description")}
                        </label>
                        <AIChatAssistant />
                        <textarea
                          onChange={handleCreatePostChange}
                          name="description"
                          className="form-control"
                          id=""
                          cols="30"
                          rows="10"
                        ></textarea>

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
                                    "Please enter text"
                                );
                                return;
                              }
                              setIsLoading(true);
                              try {
                                const prompt =
                                  "Rewrite the following text to be more professional and engaging in Vietnamese:";
                                const result = await generateContent(
                                  prompt,
                                  "text",
                                  post.description
                                );

                                if (result && result.content) {
                                  setCreatePost({
                                    ...post,
                                    description: result.content,
                                  });
                                  Toast(
                                    "success",
                                    "Content rewritten successfully!"
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
                            Use the <b>AI Assistant</b> above to generate
                            content!
                          </small>
                        </div>
                        <small>{t("addPost.descriptionHelp")}</small>
                      </div>
                      <label className="form-label">{t("addPost.tags")}</label>
                      <input
                        onChange={handleCreatePostChange}
                        name="tags"
                        className="form-control"
                        type="text"
                        placeholder="health, medicine, fitness"
                      />

                      <div className="mb-3">
                        <label className="form-label">
                          {t("addPost.status")}
                        </label>
                        <select
                          onChange={handleCreatePostChange}
                          name="status"
                          className="form-select"
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                        <small>{t("addPost.categoryHelp")}</small>
                      </div>
                    </div>
                  </div>
                  {isLoading === true ? (
                    <button
                      className="btn btn-lg btn-secondary w-100 mt-2"
                      disabled
                    >
                      {t("addPost.creatingPost")}{" "}
                      <i className="fas fa-spinner fa-spin"></i>
                    </button>
                  ) : (
                    <button
                      className="btn btn-lg btn-success w-100 mt-2"
                      type="submit"
                    >
                      {t("addPost.createPostButton")}{" "}
                      <i className="fas fa-check-circle"></i>
                    </button>
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

export default AddPost;
