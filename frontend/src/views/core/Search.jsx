import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { Link } from "react-router-dom";
import Moment from "../../plugin/Moment";
import { useTranslation } from "react-i18next";

function Search() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'users'
  const { t } = useTranslation();

  /* Live Search Logic */
  useEffect(() => {
    // Fetch all posts once on mount for instant client-side search
    // In a real large-scale app, we would debounce and hit a search API
    const fetchAllPosts = async () => {
      try {
        const response = await apiInstance.get("post/lists/");
        setAllPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts for search:", error);
      }
    };
    fetchAllPosts();
  }, []);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.length === 0) {
      setPosts([]);
      setUsers([]);
      return;
    }

    // Client-side post search
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = allPosts.filter(
      (p) =>
        p.title?.toLowerCase().includes(lowerTerm) ||
        p.description?.toLowerCase().includes(lowerTerm),
    );
    setPosts(filtered);

    // Server-side user search
    if (activeTab === "users" && searchTerm.length > 2) {
      try {
        setLoading(true);
        const res = await apiInstance.get(`user/search/?q=${searchTerm}`);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Re-trigger user search if tab changes and we have a query
    if (activeTab === "users" && query.length > 2) {
      handleSearch({ target: { value: query } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const clearSearch = () => {
    setQuery("");
    setPosts([]);
    setUsers([]);
  };

  return (
    <div>
      <Header />
      <section className="bg-light pt-5 pb-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <h2 className="fw-bold mb-4">
                {t("header.search") || "Search Articles"}
              </h2>
              <div className="position-relative">
                <input
                  type="text"
                  onChange={handleSearch}
                  className="form-control form-control-lg ps-5 rounded-pill shadow-sm"
                  placeholder={t("search.placeholder") || "Type to search..."}
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
            <div className="col-md-6">
              <ul className="nav nav-pills nav-fill bg-white rounded-pill shadow-sm p-1">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "posts" ? "active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                  >
                    {t("search.articles", "Articles")}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-pill ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                  >
                    {t("search.people", "People")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-5">
        <div className="container">
          <div className="row">
            {activeTab === "posts" &&
              (posts.length > 0 ? (
                posts.map((post) => (
                  <div className="col-sm-6 col-lg-4" key={post.id}>
                    <div className="card mb-4 animate-fade-in-up">
                      <div className="card-fold position-relative">
                        <img
                          className="card-img"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                          }}
                          src={post.image}
                          alt={post.title}
                        />
                      </div>
                      <div className="card-body px-4 pt-3">
                        <h4 className="card-title">
                          <Link
                            to={`/post/${post.slug}/`}
                            className="text-decoration-none text-dark fw-bold"
                          >
                            {post.title}
                          </Link>
                        </h4>
                        <p className="text-muted small mb-2">
                          {Moment(post.date)}
                        </p>
                        <p
                          className="card-text text-muted"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  {query.length > 0 ? (
                    <p className="text-muted">
                      {t("search.noResults", {
                        defaultValue: `No results found for "${query}"`,
                        query: query,
                      })}
                    </p>
                  ) : (
                    <p className="text-muted">
                      {t("search.startTyping", {
                        defaultValue: "Start typing to search...",
                      })}
                    </p>
                  )}
                </div>
              ))}

            {activeTab === "users" && (
              <div className="col-md-8 mx-auto">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : users.length > 0 ? (
                  <ul className="list-group list-group-flush bg-transparent">
                    {users.map((user) => (
                      <li
                        key={user.id}
                        className="list-group-item d-flex align-items-center border-0 mb-3 rounded shadow-sm hover-bg-light"
                      >
                        <Link
                          to={`/profile/${user.id}/`}
                          className="d-flex align-items-center text-decoration-none w-100 text-dark"
                        >
                          <div className="position-relative me-3">
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
                              className="rounded-circle border"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold fs-5">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-muted">@{user.username}</div>
                            <p
                              className="small text-muted mb-0 text-truncate"
                              style={{ maxWidth: "250px" }}
                            >
                              {user.profile?.bio || ""}
                            </p>
                          </div>
                          <div className="ms-auto">
                            <i className="fas fa-chevron-right text-muted"></i>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="col-12 text-center py-5">
                    {query.length > 0 ? (
                      <p className="text-muted">
                        {t("search.noResults", {
                          defaultValue: `No results found for "${query}"`,
                          query: query,
                        })}
                      </p>
                    ) : (
                      <p className="text-muted">
                        {t("search.startTyping", {
                          defaultValue: "Start typing to search...",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Search;
