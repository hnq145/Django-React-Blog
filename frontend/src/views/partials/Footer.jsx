import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="row bg-dark py-5 mx-0 card card-header  flex-row align-items-center text-center text-md-start">
        <div className="col-md-5 mb-3 mb-md-0">
          <div className="text-primary-hover text-white">
            2025{" "}
            <a
              href="https://www.youtube.com/@hnq145"
              className="text-reset btn-link ms-2 me-2 "
              target="_blank"
            >
              Hoang Ngoc Quy
            </a>
            | {t('footer.rights')}
          </div>
        </div>
        <div className="col-md-4">
          <ul className="nav text-primary-hover justify-content-center justify-content-md-end">
            <li className="nav-item">
              <a
                className="nav-link text-white px-2 fs-5"
                href="https://www.facebook.com/hnq145"
              >
                <i className="fab fa-facebook-square" />
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-white px-2 fs-5"
                href="https://x.com/hnq145?fbclid=IwY2xjawKzjS1leHRuA2FlbQIxMABicmlkETFtNDdVZmFNMG5IcFVBbk94AR7_VXOzWYzupnGO-aekuTnw_LhQypZxU1nTBlVgd4FcD-MWDsyesYfbK7penw_aem_6eGBoADDXl_fAvyMRH8PWA"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link text-white px-2 fs-5"
                href="https://youtube.com/@hnq"
              >
                <i className="fab fa-youtube-square" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
