import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    menu: "Menu",
    search: "Search Articles",
    home: "Home",
    category: "Category",
    pages: "Pages",
    about: "About",
    contact: "Contact",
    dashboard: "Dashboard",
    posts: "Posts",
    addPost: "Add Post",
    comments: "Comments",
    notifications: "Notifications",
    profile: "Profile",
    register: "Register",
    login: "Login",
    logout: "Logout",
  },
  vi: {
    menu: "Menu",
    search: "Tìm kiếm bài viết",
    home: "Trang chủ",
    category: "Danh mục",
    pages: "Trang",
    about: "Về chúng tôi",
    contact: "Liên hệ",
    dashboard: "Bảng điều khiển",
    posts: "Bài viết",
    addPost: "Thêm bài viết",
    comments: "Bình luận",
    notifications: "Thông báo",
    profile: "Hồ sơ",
    register: "Đăng ký",
    login: "Đăng nhập",
    logout: "Đăng xuất",
  },
};

function Header() {
  const [isLoggedIn] = useAuthStore((state) => [state.isLoggedIn]);
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <header className="navbar-dark bg-dark navbar-sticky header-static">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          {/* <Link className="navbar-brand" to="/">
            <img
              className="navbar-brand-item dark-mode-item"
              src="https://i.postimg.cc/ZRNC1mhM/my-main-logo.png"
              style={{ width: "200px" }}
              alt="logo"
            />
          </Link> */}
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="h6 d-none d-sm-inline-block text-white">{t.menu}</span>
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="nav mt-3 mt-lg-0 px-4 flex-nowrap align-items-center">
              <div className="nav-item w-100">
                <form className="rounded position-relative">
                  <input
                    className="form-control pe-5 bg-light"
                    type="search"
                    placeholder={t.search}
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
            </div>
            <ul className="navbar-nav navbar-nav-scroll ms-auto">
              <li className="nav-item dropdown">
                <Link className="nav-link active" to="/">
                  {t.home}
                </Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link active" to="/category/">
                  {t.category}
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
                  {t.pages}
                </a>
                <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                  <li>
                    <Link className="dropdown-item" to="/about/">
                      <i className="bi bi-person-lines-fill"></i> {t.about}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/contact/">
                      <i className="bi bi-telephone-fill"></i> {t.contact}
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
                  {t.dashboard}
                </a>
                <ul className="dropdown-menu" aria-labelledby="pagesMenu">
                  <li>
                    <Link className="dropdown-item" to="/dashboard/">
                      <i className="fas fa-user"></i> {t.dashboard}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/posts/">
                      <i className="bi bi-grid-fill"></i> {t.posts}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/add-post/">
                      <i className="fas fa-plus-circle"></i> {t.addPost}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/comments/">
                      <i className="bi bi-chat-left-quote-fill"></i> {t.comments}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/notifications/">
                      <i className="fas fa-bell"></i> {t.notifications}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile/">
                      <i className="fas fa-user-gear"></i> {t.profile}
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
                      {t.dashboard} <i className="fas fa-user-plus"></i>
                    </Link>
                    <Link
                      to={"/logout/"}
                      className="btn btn-success ms-2"
                      href="dashboard.html"
                    >
                      {t.logout} <i className="fas fa-sign-in-alt"></i>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={"/register/"}
                      className="btn btn-success"
                      href="dashboard.html"
                    >
                      {t.register} <i className="fas fa-user-plus"></i>
                    </Link>
                    <Link
                      to={"/login/"}
                      className="btn btn-success ms-2"
                      href="dashboard.html"
                    >
                      {t.login} <i className="fas fa-sign-in-alt"></i>
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
