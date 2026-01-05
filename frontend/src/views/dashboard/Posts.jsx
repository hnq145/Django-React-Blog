import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import apiInstance from "../../utils/axios";

import moment from "moment";
import Moment from "../../plugin/Moment";

function Posts() {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const post_res = await apiInstance.get(`author/dashboard/post-list/`);
      setAllPosts(post_res.data);
      setFilteredPosts(post_res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let posts = [...allPosts];

    if (searchQuery) {
      posts = posts.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      posts = posts.filter((p) => p.status.toLowerCase() === statusFilter);
    }

    if (sortOption === "newest") {
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "oldest") {
      posts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "a-z") {
      posts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "z-a") {
      posts.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredPosts(posts);
    setCurrentPage(1);
  }, [searchQuery, sortOption, statusFilter, allPosts]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <>
      <Header />
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border bg-transparent rounded-3">
                <div className="card-header bg-transparent border-bottom p-3">
                  <div className="d-sm-flex justify-content-between align-items-center">
                    <h5 className="mb-2 mb-sm-0">
                      {t("dashboard.allBlogPosts")}{" "}
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {filteredPosts.length}
                      </span>
                    </h5>
                    <a
                      href="/create-post"
                      className="btn btn-sm btn-primary mb-0"
                    >
                      {t("dashboard.addNew")} <i className="fas fa-plus"></i>
                    </a>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3 align-items-center justify-content-between mb-3">
                    <div className="col-md-8">
                      <form className="rounded position-relative">
                        <input
                          onChange={handleSearch}
                          className="form-control pe-5 bg-transparent"
                          type="search"
                          placeholder={t("header.search")}
                          aria-label="Search"
                        />
                        <button
                          className="btn bg-transparent border-0 px-2 py-0 position-absolute top-50 end-0 translate-middle-y"
                          type="submit"
                        >
                          <i className="fas fa-search fs-6 " />
                        </button>
                      </form>
                    </div>
                    <div className="col-md-2">
                      <form>
                        <select
                          onChange={handleSortChange}
                          className="form-select z-index-9 bg-transparent"
                        >
                          <option value="">{t("dashboard.sortBy")}</option>
                          <option value="newest">
                            {t("dashboard.newest")}
                          </option>
                          <option value="oldest">
                            {t("dashboard.oldest")}
                          </option>
                          <option value="a-z">{t("dashboard.a-z")}</option>
                          <option value="z-a">{t("dashboard.z-a")}</option>
                        </select>
                      </form>
                    </div>
                    <div className="col-md-2">
                      <form>
                        <select
                          onChange={handleStatusChange}
                          className="form-select z-index-9 bg-transparent"
                        >
                          <option value="">{t("dashboard.allStatuses")}</option>
                          <option value="active">{t("status.active")}</option>
                          <option value="draft">{t("status.draft")}</option>
                          <option value="disabled">
                            {t("status.disabled")}
                          </option>
                        </select>
                      </form>
                    </div>
                  </div>
                  <div className="table-responsive border-0">
                    <table className="table align-middle p-4 mb-0 table-hover table-shrink">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" className="border-0 rounded-start">
                            {t("dashboard.image")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.articleName")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.views")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.publishedDate")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.category")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.status")}
                          </th>
                          <th scope="col" className="border-0 rounded-end">
                            {t("dashboard.action")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {isLoading ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          currentPosts?.map((p, index) => (
                            <tr key={index}>
                              <td>
                                <Link to={`/detail/${p.slug}/`}>
                                  <img
                                    src={p.image}
                                    style={{
                                      width: "100px",
                                      height: "100px",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                    }}
                                    alt={p.title}
                                  />
                                </Link>
                              </td>
                              <td>
                                <h6 className="mt-2 mt-md-0 mb-0 ">
                                  <Link
                                    to={`/detail/${p.slug}/`}
                                    className="text-dark text-decoration-none"
                                  >
                                    {p?.title}
                                  </Link>
                                </h6>
                              </td>
                              <td>
                                <h6 className="mb-0">{p.view}</h6>
                              </td>
                              <td>{Moment(p.date, i18n.language)}</td>
                              <td>
                                {t(
                                  `category.${p.category?.title
                                    ?.toLowerCase()
                                    .replace(" ", "_")}`,
                                  { defaultValue: p.category?.title }
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge bg-opacity-10 ${
                                    p.status === "Active"
                                      ? "bg-success text-success"
                                      : p.status === "Draft"
                                        ? "bg-warning text-warning"
                                        : "bg-danger text-danger"
                                  }`}
                                >
                                  {t(
                                    `status.${p.status
                                      ?.toLowerCase()
                                      .replace(" ", "_")}`,
                                    { defaultValue: p.status }
                                  )}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Link
                                    to={`/edit-post/${p.id}/`}
                                    className="btn btn-primary btn-round mb-0"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={t("dashboard.edit")}
                                  >
                                    <i className="bi bi-pencil-square" />
                                  </Link>
                                  <button
                                    className="btn-round mb-0 btn btn-danger"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={t("dashboard.delete")}
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="card-footer pt-0">
                      <nav
                        className="d-flex justify-content-center"
                        aria-label="navigation"
                      >
                        <ul className="pagination">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              &laquo;
                            </button>
                          </li>
                          {[...Array(totalPages).keys()].map((number) => (
                            <li
                              key={number + 1}
                              className={`page-item ${
                                currentPage === number + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(number + 1)}
                              >
                                {number + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              &raquo;
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Posts;
