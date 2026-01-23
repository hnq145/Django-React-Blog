import React from "react";
import { Link } from "react-router-dom";

const CategorySection = ({ category, t }) => {
  return (
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
                  {t(`category.${c?.title?.toLowerCase().replace(" ", "_")}`, {
                    defaultValue: c?.title,
                  })}
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
  );
};

export default CategorySection;
