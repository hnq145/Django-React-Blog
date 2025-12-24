import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useTranslation } from "react-i18next";

function Header() {
  const [isLoggedIn] = useAuthStore((state) => [state.isLoggedIn]);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="navbar-dark bg-dark navbar-sticky header-static">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="h6 d-none d-sm-inline-block text-white">{t('header.menu')}</span>
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="nav mt-3 mt-lg-0 px-4 flex-nowrap align-items-center">
              <div className="nav-item w-100">
                <form className="rounded position-relative">
                  <input
                    className="form-control pe-5 bg-light"
                    type="search"
                    placeholder={t('header.search')}
                    aria-label="Search"
                  />
                  <Link
                    to={"/search/"}
                    className="btn bg-transparent border-0 px-2 py-0 position-absolute top-50 end-0 translate-middle-y"
                    type="submit"
                  >
                    <i className="bi bi-search fs-5"> </i>
                  </Link>
                </form>
              </div>
              <div className="nav-item dropdown ms-3">
                <a className="nav-link dropdown-toggle text-white" href="#" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {i18n.language === 'vi' ? t('header.vietnamese') : t('header.english')}
                </a>
                <ul className="dropdown-menu min-w-auto" aria-labelledby="languageDropdown">
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); changeLanguage('en'); }}>{t('header.english')}</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); changeLanguage('vi'); }}>{t('header.vietnamese')}</a></li>
                </ul>
              </div>
            </div>
            <ul className="navbar-nav navbar-nav-scroll ms-auto">
              <li className="nav-item dropdown">
                <Link className="nav-link active" to="/">
                  {t('header.home')}
                </Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link active" to="/category/">
                  {t('header.category')}
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle active"
                  href="#"
                  id="pagesMenu"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {t('header.pages')}
                </a>
                <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                  <li>
                    <Link className="dropdown-item" to="/about/">
                      <i className="bi bi-person-lines-fill"></i> {t('header.about')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/contact/">
                      <i className="bi bi-telephone-fill"></i> {t('header.contact')}
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle active"
                  href="#"
                  id="pagesMenu"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {t('header.dashboard')}
                </a>
                <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                  <li>
                    <Link className="dropdown-item" to="/dashboard/">
                      <i className="fas fa-user"></i> {t('header.dashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/posts/">
                      <i className="bi bi-grid-fill"></i> {t('header.posts')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/add-post/">
                      <i className="fas fa-plus-circle"></i> {t('header.addPost')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/comments/">
                      <i className="bi bi-chat-left-quote-fill"></i> {t('header.comments')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/notifications/">
                      <i className="fas fa-bell"></i> {t('header.notifications')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile/">
                      <i className="fas fa-user-gear"></i> {t('header.profile')}
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                {isLoggedIn() ? (
                  <>
                    <Link
                      to={"/dashboard/"}
                      className="btn btn-success"
                      href="dashboard.html"
                    >
                      {t('header.dashboard')} <i className="fas fa-user-plus"></i>
                    </Link>
                    <Link
                      to={"/logout/"}
                      className="btn btn-success ms-2"
                      href="dashboard.html"
                    >
                      {t('header.logout')} <i className="fas fa-sign-in-alt"></i>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={"/register/"}
                      className="btn btn-success"
                      href="dashboard.html"
                    >
                      {t('header.register')} <i className="fas fa-user-plus"></i>
                    </Link>
                    <Link
                      to={"/login/"}
                      className="btn btn-success ms-2"
                      href="dashboard.html"
                    >
                      {t('header.login')} <i className="fas fa-sign-in-alt"></i>
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
