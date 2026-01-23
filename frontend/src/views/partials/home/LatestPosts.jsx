import React from "react";
import { Link } from "react-router-dom";
import Moment from "../../../plugin/Moment";

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

const LatestPosts = ({
  latestPostItems,
  loading,
  feedType,
  setFeedType,
  handleSortChange,
  latestCurrentPage,
  setLatestCurrentPage,
  totalLatestPages,
  latestPageNumbers,
  t,
  i18n,
}) => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center mb-3 mb-md-0 gap-4">
            <h3
              className={`fw-bold m-0 cursor-pointer ${feedType === "latest" ? "text-primary" : "text-muted"}`}
              onClick={() => setFeedType("latest")}
              style={{ cursor: "pointer" }}
            >
              {t("index.latest")}
            </h3>
          </div>

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

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : latestPostItems?.length > 0 ? (
          <div className="row g-4">
            {latestPostItems?.map((post) => (
              <div className="col-sm-6 col-lg-3" key={post?.id}>
                <div className="card h-100 border-0 shadow-sm hover-float transition-all">
                  <Link
                    to={`/post/${post.slug}/`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="card-img-top position-relative overflow-hidden">
                      <img
                        className="img-fluid w-100 object-fit-cover"
                        style={{ height: "200px" }}
                        src={post.image}
                        alt={post.title}
                      />
                      <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-white text-dark shadow-sm">
                          <i className="fas fa-eye text-primary"></i>{" "}
                          {post.view}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <Link
                        to={`/category/${post.category?.slug}/`}
                        className="text-decoration-none"
                      >
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                          {post.category?.title
                            ? t(
                                `category.${post.category.title.toLowerCase()}`,
                                {
                                  defaultValue: post.category.title,
                                },
                              )
                            : t("index.article_badge", {
                                defaultValue: "Article",
                              })}
                        </span>
                      </Link>
                    </div>
                    <TruncatedTitle
                      title={post.title}
                      slug={post.slug}
                      className="card-title fw-bold h5 mb-3"
                    />

                    <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top border-light">
                      <Link
                        to={`/profile/${post.user?.id}/`}
                        className="text-decoration-none"
                      >
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
                      </Link>
                      <small className="text-muted">
                        {Moment(post.date, i18n.language)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <h4 className="text-muted">No posts found in this feed.</h4>
            {feedType === "following" && <p>Try following some authors!</p>}
          </div>
        )}

        {latestPostItems?.length > 0 && (
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
        )}
      </div>
    </section>
  );
};

export default LatestPosts;
