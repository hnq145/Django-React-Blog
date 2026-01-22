import React, { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { Link } from "react-router-dom";
import Moment from "../../plugin/Moment";
import { useTranslation } from "react-i18next";

function Search() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { t } = useTranslation();

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.length === 0) {
      setPosts([]);
      setUsers([]);
      setCategories([]);
      return;
    }

    setLoading(true);
    try {
      // Global Search API
      const res = await apiInstance.get(`global/search/?q=${searchTerm}`);
      setPosts(res.data.posts || []);
      setUsers(res.data.users || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setPosts([]);
    setUsers([]);
    setCategories([]);
  };

  return (
    <div>
      <Header />
      <section className="bg-light pt-5 pb-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h2 className="fw-bold mb-4">
                {t("header.search") || "Search Everything"}
              </h2>
              <div className="position-relative">
                <input
                  type="text"
                  onChange={handleSearch}
                  className="form-control form-control-lg ps-5 rounded-pill shadow-sm"
                  placeholder={
                    t("search.placeholder") ||
                    "Type to search posts, people, topics..."
                  }
                  style={{ border: "none", padding: "20px" }}
                />
                <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                {query.length > 0 && (
                  <button
                    onClick={clearSearch}
                    className="btn position-absolute top-50 end-0 translate-middle-y me-3 text-muted border-0 bg-transparent"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="row justify-content-center mt-4">
            <div className="col-md-8">
              <ul className="nav nav-pills nav-fill bg-white rounded-pill shadow-sm p-1">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                  >
                    {t("search.all", "All")}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "posts" ? "active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                  >
                    {t("search.articles", "Articles")} ({posts.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                  >
                    {t("search.people", "People")} ({users.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "categories" ? "active" : ""}`}
                    onClick={() => setActiveTab("categories")}
                  >
                    {t("search.topics", "Topics")} ({categories.length})
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-5">
        <div className="container">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {!loading && (
            <div className="row">
              {/* SHOW ALL LOGIC */}
              {activeTab === "all" && (
                <>
                  {/* Categories Section */}
                  {categories.length > 0 && (
                    <div className="col-12 mb-4">
                      <h4 className="fw-bold mb-3 border-bottom pb-2">
                        Topic Matches
                      </h4>
                      <div className="d-flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.slug}/`}
                            className="btn btn-outline-secondary rounded-pill"
                          >
                            {cat.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Section */}
                  {users.length > 0 && (
                    <div className="col-12 mb-4">
                      <h4 className="fw-bold mb-3 border-bottom pb-2">
                        People
                      </h4>
                      <div className="row">
                        {users.slice(0, 4).map((user) => (
                          <div className="col-md-6" key={user.id}>
                            <Link
                              to={`/profile/${user.id}/`}
                              className="text-decoration-none text-dark"
                            >
                              <div className="card shadow-sm border-0 mb-3 hover-up">
                                <div className="card-body d-flex align-items-center">
                                  <img
                                    src={
                                      user.profile?.image
                                        ? user.profile.image.startsWith("http")
                                          ? user.profile.image
                                          : apiInstance.defaults.baseURL +
                                            user.profile.image
                                        : `https://ui-avatars.com/api/?name=${user.username}&background=random`
                                    }
                                    alt={user.username}
                                    className="rounded-circle me-3 border"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div>
                                    <h6 className="fw-bold mb-0">
                                      {user.full_name || user.username}
                                    </h6>
                                    <small className="text-muted">
                                      @{user.username}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts Section */}
                  {posts.length > 0 && (
                    <div className="col-12">
                      <h4 className="fw-bold mb-3 border-bottom pb-2">
                        Articles
                      </h4>
                      <div className="row">
                        {posts.map((post) => (
                          <div className="col-sm-6 col-lg-4" key={post.id}>
                            <div className="card mb-4 border-0 shadow-sm h-100 animate-fade-in-up">
                              <div className="card-fold position-relative">
                                <img
                                  className="card-img-top"
                                  style={{
                                    height: "200px",
                                    objectFit: "cover",
                                  }}
                                  src={post.image}
                                  alt={post.title}
                                />
                              </div>
                              <div className="card-body">
                                <h5 className="card-title fw-bold">
                                  <Link
                                    to={`/post/${post.slug}/`}
                                    className="text-dark text-decoration-none"
                                  >
                                    {post.title}
                                  </Link>
                                </h5>
                                <p className="card-text text-muted small">
                                  {post.description?.substring(0, 100)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {posts.length === 0 &&
                    users.length === 0 &&
                    categories.length === 0 &&
                    query.length > 0 && (
                      <div className="col-12 text-center py-5">
                        <p className="text-muted">
                          No results found for "{query}"
                        </p>
                      </div>
                    )}
                </>
              )}

              {/* TAB: POSTS */}
              {activeTab === "posts" &&
                posts.map((post) => (
                  <div className="col-sm-6 col-lg-4" key={post.id}>
                    <div className="card mb-4 border-0 shadow-sm h-100">
                      <img
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                        src={post.image}
                        alt={post.title}
                      />
                      <div className="card-body">
                        <h5 className="fw-bold">
                          <Link
                            to={`/post/${post.slug}/`}
                            className="text-dark text-decoration-none"
                          >
                            {post.title}
                          </Link>
                        </h5>
                        <p className="text-muted small">{post.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

              {/* TAB: USERS */}
              {activeTab === "users" &&
                users.map((user) => (
                  <div className="col-md-6 col-lg-4" key={user.id}>
                    <div className="card p-3 border-0 shadow-sm mb-3 text-center">
                      <img
                        src={
                          user.profile?.image
                            ? user.profile.image.startsWith("http")
                              ? user.profile.image
                              : apiInstance.defaults.baseURL +
                                user.profile.image
                            : `https://ui-avatars.com/api/?name=${user.username}&background=random`
                        }
                        className="rounded-circle mx-auto mb-2"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                        alt={user.username}
                      />
                      <h5 className="fw-bold">
                        {user.full_name || user.username}
                      </h5>
                      <Link
                        to={`/profile/${user.id}/`}
                        className="btn btn-sm btn-outline-primary rounded-pill mt-2"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}

              {/* TAB: CATEGORIES */}
              {activeTab === "categories" &&
                categories.map((cat) => (
                  <div className="col-6 col-md-3" key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}/`}
                      className="text-decoration-none"
                    >
                      <div className="card p-4 border-0 shadow-sm mb-3 text-center hover-up bg-light-subtle">
                        <h5 className="fw-bold m-0 text-primary">
                          {cat.title}
                        </h5>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Search;
