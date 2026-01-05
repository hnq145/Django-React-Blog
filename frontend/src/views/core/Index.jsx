import { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import { useTranslation } from "react-i18next";

const TruncatedTitle = ({
  title,
  slug,
  maxLength = 50,
  className = "card-title",
}) => {
  return (
    <h4 className={className}>
      <Link
        to={`/post/${slug}/`}
        className="btn-link text-reset stretched-link fw-bold text-decoration-none"
      >
        {title?.length > maxLength
          ? `${title.substring(0, maxLength)}...`
          : title}
      </Link>
    </h4>
  );
};

function Index() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [category, setCategory] = useState([]);
  const { t, i18n } = useTranslation();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response_post = await apiInstance.get("post/lists/");
      const response_category = await apiInstance.get("post/category/list/");

      const sortedPosts = [...response_post.data].sort(
        (a, b) => b.view + b.likes - (a.view + a.likes)
      );

      setPosts(response_post.data);
      setSortedPosts(response_post.data);
      setTrendingPosts(sortedPosts);
      setCategory(response_category.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSortChange = (e) => {
    const order = e.target.value;
    let newSortedPosts = [...posts];

    if (order === "newest") {
      newSortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (order === "oldest") {
      newSortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (order === "a-z") {
      newSortedPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (order === "z-a") {
      newSortedPosts.sort((a, b) => b.title.localeCompare(a.title));
    }
    setSortedPosts(newSortedPosts);
  };

  // const itemsPerPage = 4; // Show top 4 trending in a special layout
  const latestItemsPerPage = 8;
  const [latestCurrentPage, setLatestCurrentPage] = useState(1);
  const indexOfLastLatestItem = latestCurrentPage * latestItemsPerPage;
  const indexOfFirstLatestItem = indexOfLastLatestItem - latestItemsPerPage;

  const latestPostItems = sortedPosts?.slice(
    indexOfFirstLatestItem,
    indexOfLastLatestItem
  );

  const totalLatestPages = Math.ceil(sortedPosts?.length / latestItemsPerPage);
  const latestPageNumbers = Array.from(
    { length: totalLatestPages },
    (_, index) => index + 1
  );

  // Trending Section Helpers
  const featuredPost = trendingPosts.length > 0 ? trendingPosts[0] : null;
  const sideTrendingPosts =
    trendingPosts.length > 1 ? trendingPosts.slice(1, 4) : [];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm" aria-hidden="true">
                <div className="placeholder-glow" style={{ height: "500px" }}>
                  <span className="placeholder col-12 h-100 rounded"></span>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    className="card border-0 shadow-sm"
                    aria-hidden="true"
                    key={i}
                  >
                    <div className="row g-0">
                      <div className="col-4">
                        <span
                          className="placeholder col-12 h-100"
                          style={{ minHeight: "100px" }}
                        ></span>
                      </div>
                      <div className="col-8">
                        <div className="card-body">
                          <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                          </h5>
                          <p className="card-text placeholder-glow">
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-4"></span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* HERO SECTION - Featured Trending Post */}
      <section className="pb-4 pt-4">
        <div className="container">
          <div className="row g-4">
            {/* Left Column: Big Featured Post */}
            <div className="col-lg-7 col-md-12">
              {featuredPost && (
                <div className="card text-white h-100 border-0 shadow-lg overflow-hidden position-relative hover-zoom">
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))",
                      zIndex: 1,
                    }}
                  ></div>
                  <img
                    src={featuredPost.image}
                    className="card-img h-100 object-fit-cover"
                    alt="Featured"
                    style={{
                      transition: "transform 0.5s",
                      height: "500px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="card-img-overlay d-flex flex-column justify-content-end p-4"
                    style={{ zIndex: 2 }}
                  >
                    <span className="badge bg-primary mb-2 w-auto align-self-start">
                      {t("index.trending_badge", {
                        defaultValue: "Trending #1 🔥",
                      })}
                    </span>
                    <h2 className="card-title fw-bold display-6">
                      <Link
                        to={`/post/${featuredPost.slug}/`}
                        className="text-white text-decoration-none stretched-link"
                      >
                        {featuredPost.title}
                      </Link>
                    </h2>
                    <div className="d-flex align-items-center mt-2 text-white-50">
                      <small>
                        <i className="fas fa-user me-1"></i>{" "}
                        {featuredPost.user?.username}
                      </small>
                      <span className="mx-2">•</span>
                      <small>
                        <i className="fas fa-calendar me-1"></i>{" "}
                        {Moment(featuredPost.date, i18n.language)}
                      </small>
                      <span className="mx-2">•</span>
                      <small>
                        <i className="fas fa-eye me-1"></i> {featuredPost.view}{" "}
                        {t("index.views", { defaultValue: "Views" })}
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: List of other trending posts */}
            <div className="col-lg-5 col-md-12 d-flex flex-column justify-content-between">
              <h4 className="fw-bold mb-3 border-start border-4 border-primary ps-3">
                {t("index.trending")}
              </h4>
              <div className="d-flex flex-column gap-3">
                {sideTrendingPosts.map((post) => (
                  <div
                    className="card border-0 shadow-sm hover-elevate"
                    key={post.id}
                  >
                    <div className="row g-0 align-items-center">
                      <div className="col-4 overflow-hidden rounded-start">
                        <img
                          src={post.image}
                          className="img-fluid rounded-start h-100 object-fit-cover"
                          alt={post.title}
                          style={{ minHeight: "100px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="col-8">
                        <div className="card-body py-2">
                          <Link
                            to={`/post/${post.slug}/`}
                            className="text-decoration-none text-dark stretched-link"
                          >
                            <h6 className="card-title fw-bold mb-1 line-clamp-2">
                              {post.title}
                            </h6>
                          </Link>
                          <div className="small text-muted">
                            <i className="fas fa-eye me-1"></i> {post.view} •{" "}
                            {Moment(post.date, i18n.language)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-light rounded text-center border-start border-4 border-info">
                <i className="fas fa-lightbulb text-warning mb-2 fa-2x"></i>
                <p className="mb-0 text-muted small fw-medium">
                  {t("index.discovery_text")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - Pill Style */}
      <section className="py-5 bg-light-subtle">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold m-0">{t("index.categories")}</h3>
            <Link
              to="/category"
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              {t("index.view_all", { defaultValue: "View All" })}
            </Link>
          </div>

          <div className="row g-3">
            {category?.map((c) => (
              <div className="col-6 col-md-4 col-lg-2" key={c.id}>
                <Link
                  to={`/category/${c.slug || "#"}`}
                  className="card text-decoration-none border-0 shadow-sm hover-up h-100 text-center p-3 align-items-center justify-content-center transition-all bg-white"
                >
                  <div
                    className="mb-2 rounded-circle bg-light p-1 d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "64px", height: "64px" }}
                  >
                    <img
                      src={c.image}
                      alt={c.title}
                      className="rounded-circle object-fit-cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <h6 className="fw-bold text-dark m-0">
                    {t(
                      `category.${c?.title?.toLowerCase().replace(" ", "_")}`,
                      { defaultValue: c?.title }
                    )}
                  </h6>
                  <small className="text-muted">
                    {c.post_count || 0}{" "}
                    {t("index.articles", { defaultValue: "Articles" })}
                  </small>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST POSTS */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold m-0">{t("index.latest")}</h3>
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted fw-medium d-none d-md-block">
                {t("common.sortBy", { defaultValue: "Sort By" })}:
              </span>
              <select
                className="form-select form-select-sm shadow-none border-secondary-subtle"
                style={{ width: "150px" }}
                onChange={handleSortChange}
              >
                <option value="newest">{t("dashboard.newest")}</option>
                <option value="oldest">{t("dashboard.oldest")}</option>
                <option value="a-z">{t("dashboard.a-z")}</option>
                <option value="z-a">{t("dashboard.z-a")}</option>
              </select>
            </div>
          </div>

          <div className="row g-4">
            {latestPostItems?.map((post) => (
              <div className="col-sm-6 col-lg-3" key={post?.id}>
                <div className="card h-100 border-0 shadow-sm hover-float transition-all">
                  <div className="card-img-top position-relative overflow-hidden">
                    <img
                      className="img-fluid w-100 object-fit-cover"
                      style={{ height: "200px" }}
                      src={post.image}
                      alt={post.title}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-white text-dark shadow-sm">
                        <i className="fas fa-eye text-primary"></i> {post.view}
                      </span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                        {post.category?.title
                          ? t(`category.${post.category.title.toLowerCase()}`, {
                              defaultValue: post.category.title,
                            })
                          : t("index.article_badge", {
                              defaultValue: "Article",
                            })}
                      </span>
                    </div>
                    <TruncatedTitle
                      title={post.title}
                      slug={post.slug}
                      className="card-title fw-bold h5 mb-3"
                    />

                    <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top border-light">
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary me-2 overflow-hidden"
                          style={{ width: "32px", height: "32px" }}
                        >
                          {post.user?.image ? (
                            <img
                              src={post.user.image}
                              style={{ width: "100%", height: "100%" }}
                            />
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <small
                          className="text-muted fw-medium text-truncate"
                          style={{ maxWidth: "80px" }}
                        >
                          {post?.user?.username || "Admin"}
                        </small>
                      </div>
                      <small className="text-muted">{Moment(post.date)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="d-flex justify-content-center mt-5">
            <ul className="pagination mb-0 gap-2">
              <li
                className={`page-item ${latestCurrentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                  onClick={() => setLatestCurrentPage(latestCurrentPage - 1)}
                  style={{ width: "45px", height: "45px" }}
                >
                  <i className="fas fa-chevron-left" />
                </button>
              </li>

              {latestPageNumbers.map((number) => (
                <li
                  key={number}
                  className={`page-item ${latestCurrentPage === number ? "active" : ""}`}
                >
                  <button
                    className={`page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center fw-bold ${latestCurrentPage === number ? "bg-primary text-white" : "text-dark bg-white"}`}
                    onClick={() => setLatestCurrentPage(number)}
                    style={{ width: "45px", height: "45px" }}
                  >
                    {number}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${latestCurrentPage === totalLatestPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center"
                  onClick={() => setLatestCurrentPage(latestCurrentPage + 1)}
                  style={{ width: "45px", height: "45px" }}
                >
                  <i className="fas fa-chevron-right" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      {/* TOP WRITERS - Derived from posts */}
      <section className="py-5 bg-light-subtle">
        <div className="container">
          <div className="row align-items-center mb-4">
            <div className="col-lg-6">
              <h3 className="fw-bold m-0">
                {t("index.top_writers", { defaultValue: "Top Writers" })} ✍️
              </h3>
              <p className="text-muted m-0">
                {t("index.top_writers_desc", {
                  defaultValue: "Discover our most occurring writers.",
                })}
              </p>
            </div>
          </div>

          <div className="row g-3">
            {(() => {
              const authorMap = new Map();
              posts.forEach((post) => {
                if (post.user) {
                  const id = post.user.id || post.user.username;
                  if (!authorMap.has(id)) {
                    authorMap.set(id, { ...post.user, count: 0, views: 0 });
                  }
                  const author = authorMap.get(id);
                  author.count += 1;
                  author.views += post.view;
                }
              });
              const topAuthors = Array.from(authorMap.values())
                .sort((a, b) => b.views - a.views)
                .slice(0, 4);

              return topAuthors.map((author) => (
                <div
                  className="col-md-6 col-lg-3"
                  key={author.id || author.username}
                >
                  <div className="card h-100 border-0 shadow-sm p-3 text-center hover-up">
                    <div
                      className="position-relative mx-auto mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      {author.image ? (
                        <img
                          src={author.image}
                          className="rounded-circle object-fit-cover w-100 h-100 border border-3 border-light shadow-sm"
                          alt={author.username}
                        />
                      ) : (
                        <div className="w-100 h-100 rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center border border-3 border-light shadow-sm">
                          <span className="fs-3 fw-bold text-primary">
                            {author.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-success border border-white">
                        <i className="fas fa-check-circle fa-xs"></i>
                      </span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">
                      {author.username}
                    </h6>
                    <small className="text-muted d-block mb-3">
                      {author.bio ||
                        t("index.content_creator", {
                          defaultValue: "Content Creator",
                        })}
                    </small>

                    <div className="d-flex justify-content-around border-top pt-3 w-100 mt-auto">
                      <div>
                        <span className="fw-bold d-block text-dark">
                          {author.count}
                        </span>
                        <small
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {t("index.articles", { defaultValue: "Articles" })}
                        </small>
                      </div>
                      <div>
                        <span className="fw-bold d-block text-dark">
                          {author.views}
                        </span>
                        <small
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {t("index.views", { defaultValue: "Views" })}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-5 position-relative overflow-hidden my-5">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-primary"
          style={{ opacity: 0.05, zIndex: -1 }}
        ></div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="d-inline-block p-3 rounded-circle bg-primary-subtle text-primary mb-3">
                <i className="fas fa-paper-plane fa-2x"></i>
              </div>
              <h2 className="fw-bold mb-3 display-6">
                {t("index.newsletter_title", {
                  defaultValue: "Subscribe to Newsletter",
                })}
              </h2>
              <p className="text-muted mb-4 lead">
                {t("index.newsletter_desc", {
                  defaultValue:
                    "Get the latest posts, tutorials, and freebies delivered straight to your inbox. We promise no spam.",
                })}
              </p>
              <form
                className="d-flex justify-content-center gap-2 flex-column flex-sm-row mx-auto"
                style={{ maxWidth: "500px" }}
              >
                <input
                  type="email"
                  className="form-control border-0 shadow-sm"
                  placeholder={t("index.email_placeholder", {
                    defaultValue: "Enter your email address",
                  })}
                />
                <button
                  className="btn btn-primary px-4 fw-bold shadow-soft text-nowrap"
                  type="button"
                >
                  {t("index.subscribe", { defaultValue: "Subscribe" })}
                </button>
              </form>
              <small className="text-muted mt-3 d-block">
                {t("index.privacy_text", {
                  defaultValue: "We care about your data in our",
                })}{" "}
                <a href="#" className="text-decoration-underline">
                  {t("index.privacy_policy", {
                    defaultValue: "privacy policy",
                  })}
                </a>
                .
              </small>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Index;
