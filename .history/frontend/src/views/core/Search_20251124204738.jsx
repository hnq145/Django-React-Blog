import React from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    searchTitle: "Search All Articles",
    searchPlaceholder: "Search All Articles",
  },
  vi: {
    searchTitle: "Tìm kiếm tất cả bài viết",
    searchPlaceholder: "Tìm kiếm tất cả bài viết",
  },
};

function Search() {
  const { language } = useLanguage();
  const t = translations[language];

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
              <div className="d-flex justify-content-between align-items-center mt-1">
                <h2 className="text-start d-block">
                  <i className="fas fa-search"></i> {t.searchTitle}
                </h2>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder={t.searchPlaceholder}
                name=""
                id=""
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Search;