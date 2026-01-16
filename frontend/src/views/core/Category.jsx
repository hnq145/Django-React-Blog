import { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import { useTranslation } from "react-i18next";

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await apiInstance.get("post/category/list/");
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <Header />
      <section className="bg-light-subtle py-5">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h1 className="fw-bold display-5 mb-3">
                {t("index.categories", "Categories")}
              </h1>
              <p className="lead text-muted">{t("index.explore_topics")}</p>
            </div>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="col-6 col-md-4 col-lg-3" key={i}>
                  <div
                    className="card h-100 border-0 shadow-sm"
                    aria-hidden="true"
                  >
                    <div className="card-body text-center d-flex flex-column align-items-center justify-content-center p-4">
                      <div
                        className="placeholder rounded-circle mb-3"
                        style={{ width: "80px", height: "80px" }}
                      ></div>
                      <span className="placeholder col-8 mb-2"></span>
                      <span className="placeholder col-4"></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {categories?.map((c) => (
                <div className="col-6 col-md-4 col-lg-3" key={c.id}>
                  <Link
                    to={`/category/${c.slug}/`}
                    className="card h-100 border-0 shadow-sm hover-up text-center text-decoration-none"
                  >
                    <div className="card-body p-4 d-flex flex-column align-items-center">
                      <div
                        className="mb-3 p-1 bg-white rounded-circle shadow-sm position-relative overflow-hidden"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <img
                          src={c.image}
                          alt={c.title}
                          className="rounded-circle object-fit-cover w-100 h-100"
                        />
                      </div>
                      <h4 className="fw-bold text-dark mb-1">
                        {t(
                          `category.${c?.title?.toLowerCase().replace(" ", "_")}`,
                          { defaultValue: c?.title }
                        )}
                      </h4>
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mt-2">
                        {c.post_count || 0}{" "}
                        {t("index.articles", { defaultValue: "Articles" })}
                      </span>
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

export default Category;
