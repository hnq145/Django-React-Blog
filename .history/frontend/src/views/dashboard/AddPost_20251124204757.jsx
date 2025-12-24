import { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";
import AIChatAssistant from "../partials/AIChatAssistant";
import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    createPost: "Create Blog Post",
    useBuilder: "Use the article builder below to write your article.",
    backToPosts: "Back to Posts",
    saveChanges: "Save Changes",
    basicInfo: "Basic Information",
    preview: "Preview",
    thumbnail: "Thumbnail",
    title: "Title",
    titleHelp: "Write a 60 character post title.",
    category: "Posts category",
    categoryHelp: "Help people find your posts by choosing categories that represent your post.",
    description: "Post Description",
    descriptionHelp: "A brief summary of your posts.",
    tags: "Tags",
    status: "Status",
    creatingPost: "Creating Post...",
    createPostButton: "Create Post",
  },
  vi: {
    createPost: "Tạo bài viết trên blog",
    useBuilder: "Sử dụng trình tạo bài viết bên dưới để viết bài viết của bạn.",
    backToPosts: "Quay lại bài viết",
    saveChanges: "Lưu thay đổi",
    basicInfo: "Thông tin cơ bản",
    preview: "Xem trước",
    thumbnail: "Hình nhỏ",
    title: "Tiêu đề",
    titleHelp: "Viết tiêu đề bài viết dài 60 ký tự.",
    category: "Danh mục bài viết",
    categoryHelp: "Giúp mọi người tìm thấy bài viết của bạn bằng cách chọn các danh mục đại diện cho bài viết của bạn.",
    description: "Mô tả bài viết",
    descriptionHelp: "Tóm tắt ngắn gọn về bài viết của bạn.",
    tags: "Thẻ",
    status: "Trạng thái",
    creatingPost: "Đang tạo bài viết...",
    createPostButton: "Tạo bài viết",
  },
};

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
  const userData = useUserData();
  const userId = userData?.user_id;
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

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
      Toast("error", "User not authenticated. Please login again.");
      setIsLoading(false);
      return;
    }

    if (!post.title || !post.description || !post.image) {
      Toast("error", "All Fields Are Required To Create A Post");
      setIsLoading(false);
      return;
    }

    if (!post.status) {
      Toast("error", "Please select a post status");
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
        title: "Post created successfully.",
      });
      navigate("/posts/");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Toast("error", error.response?.data?.detail || "Error creating post");
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
                              {t.createPost}
                            </h1>
                            <p className="mb-0 text-white lead">
                              {t.useBuilder}
                            </p>
                          </div>
                          <div>
                            <Link
                              to="/instructor/posts/"
                              className="btn"
                              style={{ backgroundColor: "white" }}
                            >
                              {" "}
                              <i className="fas fa-arrow-left"></i> {t.backToPosts}
                            </Link>
                            <a
                              href="instructor-posts.html"
                              className="btn btn-dark ms-2"
                            >
                              {t.saveChanges}{" "}
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
                      <h4 className="mb-0">{t.basicInfo}</h4>
                    </div>
                    <div className="card-body">
                      <label htmlFor="postTHumbnail" className="form-label">
                        {t.preview}
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
                          {t.thumbnail}
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
                        <label className="form-label">{t.title}</label>
                        <input
                          onChange={handleCreatePostChange}
                          name="title"
                          className="form-control"
                          type="text"
                          placeholder=""
                        />
                        <small>{t.titleHelp}</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t.category}</label>
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
                        <small>
                          {t.categoryHelp}
                        </small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">{t.description}</label>
                        <AIChatAssistant />
                        <textarea
                          onChange={handleCreatePostChange}
                          name="description"
                          className="form-control"
                          id=""
                          cols="30"
                          rows="10"
                        ></textarea>
                        <small>{t.descriptionHelp}</small>
                      </div>
                      <label className="form-label">{t.tags}</label>
                      <input
                        onChange={handleCreatePostChange}
                        name="tags"
                        className="form-control"
                        type="text"
                        placeholder="health, medicine, fitness"
                      />

                      <div className="mb-3">
                        <label className="form-label">{t.status}</label>
                        <select
                          onChange={handleCreatePostChange}
                          name="status"
                          className="form-select"
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                        <small>
                          {t.categoryHelp}
                        </small>
                      </div>
                    </div>
                  </div>
                  {isLoading === true ? (
                    <button
                      className="btn btn-lg btn-secondary w-100 mt-2"
                      disabled
                    >
                      {t.creatingPost}{" "}
                      <i className="fas fa-spinner fa-spin"></i>
                    </button>
                  ) : (
                    <button
                      className="btn btn-lg btn-success w-100 mt-2"
                      type="submit"
                    >
                      {t.createPostButton} <i className="fas fa-check-circle"></i>
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
