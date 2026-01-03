import React, { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { Link } from "react-router-dom";
import Moment from "../../plugin/Moment";
import { useTranslation } from "react-i18next";

function Search() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const { t } = useTranslation();

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    if (searchTerm.length > 2) {
      try {
        // Assuming generic post list can be filtered or we use a specific endpoint
        // Since we don't have a dedicated search endpoint in the summary,
        // we'll fetch all and filter client side for "demo" purposes if API doesn't support it,
        // OR use a likely API pattern. Let's try filtered fetch if backend supports it,
        // otherwise client filter. Re-checking backend views...
        // Backend URL summary showed 'post/lists/'.
        // Let's standard fetch and filter client side for better responsiveness in this demo.
        const response = await apiInstance.get("post/lists/");
        const filtered = response.data.filter(
          (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPosts(filtered);
      } catch (error) {
        console.error(error);
      }
    } else {
      setPosts([]);
    }
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-5">
        <div className="container">
          <div className="row">
            {posts.length > 0 ? (
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
                {query.length > 0 && (
                  <p className="text-muted">No results found for "{query}"</p>
                )}
                {query.length === 0 && (
                  <p className="text-muted">Start typing to search...</p>
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
