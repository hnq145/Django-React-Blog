import { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import { useTranslation } from "react-i18next";

function Index() {
  const [posts, setPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [category, setCategory] = useState([]);
  const { t } = useTranslation();

  const TruncatedTitle = ({ title, slug }) => {
    const [isTruncated, setIsTruncated] = useState(true);
    const maxLength = 20;
    const isLong = title.length > maxLength;

    function toggleTruncate(e) {
      e.preventDefault();
      e.stopPropagation();
      setIsTruncated(!isTruncated);
    }

    if (!isLong) {
      return (
        <div style={{ minHeight: "60px" }}>
          <h4 className="card-title">
            <Link
              to={`/post/${slug}/`}
              className="btn-link text-reset stretched-link fw-bold text-decoration-none"
            >
              {title}
            </Link>
          </h4>
        </div>
      );
    }

    const truncatedTitleText = `${title.substring(0, maxLength)}...`;

    return (
      <div style={{ minHeight: "60px" }}>
        <h4 className="card-title">
          <Link
            to={`/post/${slug}/`}
            className="btn-link text-reset stretched-link fw-bold text-decoration-none"
          >
            {isTruncated ? truncatedTitleText : title}
          </Link>
        </h4>

        {isTruncated ? (
          <a
            href="#"
            onClick={toggleTruncate}
            className="fw-bold"
            style={{ position: "relative", zIndex: 1, textDecoration: "none" }}
          >
            Xem thêm
          </a>
        ) : (
          <a
            href="#"
            onClick={toggleTruncate}
            className="fw-bold"
            style={{ position: "relative", zIndex: 1, textDecoration: "none" }}
          >
            Thu gọn
          </a>
        )}
      </div>
    );
  };

  const fetchPosts = async () => {
    try {
      const response_post = await apiInstance.get("post/lists/");
      const response_category = await apiInstance.get("post/category/list/?t=" + new Date().getTime());

      const sortedPosts = [...response_post.data].sort(
        (a, b) => b.view + b.likes - (a.view + a.likes)
      );

      setPosts(response_post.data);
      setSortedPosts(response_post.data);
      setTrendingPosts(sortedPosts);
      setCategory(response_category.data);
    } catch (error) {
      console.error(error);
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

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const postItems = trendingPosts?.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(trendingPosts?.length / itemsPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const latestItemsPerPage = 12;
  const [latestCurrentPage, setLatestCurrentPage] = useState(1);
  const indexOfLastLatestItem = latestCurrentPage * latestItemsPerPage;
  const indexOfFirstLatestItem = indexOfLastLatestItem - latestItemsPerPage;

  const latestPostItems = sortedPosts?.slice(indexOfFirstLatestItem, indexOfLastLatestItem);

  const totalLatestPages = Math.ceil(sortedPosts?.length / latestItemsPerPage);
  const latestPageNumbers = Array.from(
    { length: totalLatestPages },
    (_, index) => index + 1
  );

  return (
    <div>
      <Header />
      <section className="p-0">
        <div className="container">
          <div className="row">
            <div className="col">
              <a href="#" className="d-block card-img-flash">
                <img src="assets/images/adv-3.png" alt="" />
              </a>
              <h2 className="text-start d-block mt-1">{t('index.trending')}</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-0">
        <div className="container">
          <div className="row">
            {postItems?.map((post) => (
              <div className="col-sm-6 col-lg-3" key={post?.id}>
                <div className="card mb-4">
                  <div className="card-fold position-relative">
                    <img
                      className="card-img"
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                      }}
                      src={post.image}
                    />
                  </div>
                  <div 
                    className="card-body px-3 pt-3"
                    style={{
                      height: "250px",
                      overflow: "hidden",
                    }}
                  >
                    <TruncatedTitle title={post.title} slug={post.slug} />
                    <div style={{ display: "flex" }}>
                      <button style={{ border: "none", background: "none" }}>
                        <i className="fas fa-bookmark text-danger"></i>
                      </button>
                      <button style={{ border: "none", background: "none" }}>
                        <i className="fas fa-thumbs-up text-primary"></i>
                      </button>
                    </div>

                    <ul
                      className="mt-3 list-style-none"
                      style={{ listStyle: "none" }}
                    >
                      <li>
                        <a href="#" className="text-dark text-decoration-none">
                          <i className="fas fa-user"></i>{" "}
                          {post?.user?.username || t('index.defaultAuthor')}
                        </a>
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-calendar"></i> {Moment(post.date)}
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-eye"></i> {post?.view} {t('index.views')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="d-flex mt-2">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-dark fw-bold me-1 rounded"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="fas fa-arrow-left me-2" />
                  {t('index.previous')}
                </button>
              </li>
            </ul>
            <ul className="pagination">
              {pageNumbers.map((number) => (
                <li
                  key={number}
                  className={`page-item ${currentPage === number ? "active text-white" : ""}`}
                >
                  <button
                    className="page-link text-dark fw-bold rounded"
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-dark fw-bold ms-1 rounded"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {t('index.next')}
                  <i className="fas fa-arrow-right ms-3 " />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <section className="bg-light pt-5 pb-5 mb-3 mt-3">
        <div className="container">
          <div className="row g-0">
            <div className="col-12 ">
              <div className="mb-4">
                <h2>{t('index.categories')}</h2>
              </div>
              <div className="d-flex flex-wrap justify-content-between">
                {category?.map((c) => (
                  <div className="mt-2" key={c.id}>
                    <div className="card bg-transparent">
                      <img
                        className="card-img"
                        src={c.image}
                        style={{
                          width: "150px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                        alt="card image"
                      />
                      <div className="d-flex flex-column align-items-center mt-3 pb-2">
                        <h5 className="mb-0">{t(`category.${c.title.toLowerCase()}`)}</h5>
                        <small>{c.post_count || "0"} {t('index.articles')}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-0">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-start d-block mt-1">{t('index.latest')}</h2>
            <div className="col-md-3">
              <select className="form-select" onChange={handleSortChange}>
                <option value="newest">{t('dashboard.newest')}</option>
                <option value="oldest">{t('dashboard.oldest')}</option>
                <option value="a-z">{t('dashboard.a-z')}</option>
                <option value="z-a">{t('dashboard.z-a')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-0">
        <div className="container">
          <div className="row">
            {latestPostItems?.map((post) => (
              <div className="col-sm-6 col-lg-3" key={post?.id}>
                <div className="card mb-4">
                  <div className="card-fold position-relative">
                    <img
                      className="card-img"
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                      }}
                      src={post.image}
                    />
                  </div>
                  <div 
                    className="card-body px-3 pt-3"
                    style={{
                      height: "250px",
                      overflow: "hidden",
                    }}
                  >
                    <TruncatedTitle title={post.title} slug={post.slug} />
                    <div style={{ display: "flex" }}>
                      <button style={{ border: "none", background: "none" }}>
                        <i className="fas fa-bookmark text-danger"></i>
                      </button>
                      <button style={{ border: "none", background: "none" }}>
                        <i className="fas fa-thumbs-up text-primary"></i>
                      </button>
                    </div>

                    <ul
                      className="mt-3 list-style-none"
                      style={{ listStyle: "none" }}
                    >
                      <li>
                        <a href="#" className="text-dark text-decoration-none">
                          <i className="fas fa-user"></i>{" "}
                          {post?.user?.username || t('index.defaultAuthor')}
                        </a>
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-calendar"></i> {Moment(post.date)}
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-eye"></i> {post?.view} {t('index.views')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <nav className="d-flex mt-2">
            <ul className="pagination">
              <li
                className={`page-item ${latestCurrentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-dark fw-bold me-1 rounded"
                  onClick={() => setLatestCurrentPage(latestCurrentPage - 1)}
                >
                  <i className="fas fa-arrow-left me-2" />
                  {t('index.previous')}
                </button>
              </li>
            </ul>
            <ul className="pagination">
              {latestPageNumbers.map((number) => (
                <li
                  key={number}
                  className={`page-item ${latestCurrentPage === number ? "active text-white" : ""}`}
                >
                  <button
                    className="page-link text-dark fw-bold rounded"
                    onClick={() => setLatestCurrentPage(number)}
                  >
                    {number}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="pagination">
              <li
                className={`page-item ${latestCurrentPage === totalLatestPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link text-dark fw-bold ms-1 rounded"
                  onClick={() => setLatestCurrentPage(latestCurrentPage + 1)}
                >
                  {t('index.next')}
                  <i className="fas fa-arrow-right ms-3 " />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Index;


