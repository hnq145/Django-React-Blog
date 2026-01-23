import React from "react";
import { Link } from "react-router-dom";
import Moment from "../../../plugin/Moment";

const HeroSection = ({ featuredPost, sideTrendingPosts, t, i18n }) => {
  if (!featuredPost) return null;

  return (
    <section className="pb-4 pt-4">
      <div className="container">
        <div className="row g-4">
          {/* Left Column: Big Featured Post */}
          <div className="col-lg-7 col-md-12">
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
  );
};

export default HeroSection;
