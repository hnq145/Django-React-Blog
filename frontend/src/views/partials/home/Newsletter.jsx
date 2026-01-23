import React from "react";

const Newsletter = ({ t }) => {
  return (
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
  );
};

export default Newsletter;
