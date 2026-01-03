import React from "react";

function Footer() {
  return (
    <footer
      className="pt-5 pb-3"
      style={{ background: "linear-gradient(to bottom, #f8fafc, #e2e8f0)" }}
    >
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-md-5 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <h4 className="fw-bold mb-0 me-3 text-primary">BlogAI.</h4>
              <small className="text-muted">Empowered by Gemini</small>
            </div>
            <p className="text-muted mt-2 small">
              A modern blogging platform integrated with AI to help you write
              better and faster.
            </p>
          </div>
          <div className="col-md-5 text-md-end">
            <ul className="nav justify-content-center justify-content-md-end">
              <li className="nav-item">
                <a
                  className="nav-link text-dark"
                  href="https://www.facebook.com/hnq145"
                  target="_blank"
                >
                  <i className="fab fa-facebook-square fs-5"></i>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link text-dark"
                  href="https://x.com/hnq145?fbclid=IwY2xjawKzjS1leHRuA2FlbQIxMABicmlkETFtNDdVZmFNMG5IcFVBbk94AR7_VXOzWYzupnGO-aekuTnw_LhQypZxU1nTBlVgd4FcD-MWDsyesYfbK7penw_aem_6eGBoADDXl_fAvyMRH8PWA"
                  target="_blank"
                >
                  <i className="fa-brands fa-x-twitter fs-5"></i>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link text-dark"
                  href="https://youtube.com/@hnq"
                  target="_blank"
                >
                  <i className="fab fa-youtube-square fs-5"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" style={{ borderColor: "rgba(0,0,0,0.05)" }} />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="text-muted">
              © 2025 BlogAI. All rights reserved.
            </small>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-decoration-none small text-muted me-3">
              Privacy Policy
            </a>
            <a href="#" className="text-decoration-none small text-muted">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
