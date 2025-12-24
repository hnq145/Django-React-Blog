import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    title: "Create New Password",
    subtitle: "Choose a new password for your account",
    enterPassword: "Enter New Password",
    confirmPassword: "Confirm New Password",
    invalidPassword: "Please enter valid password.",
    savePassword: "Save New Password",
  },
  vi: {
    title: "Tạo mật khẩu mới",
    subtitle: "Chọn mật khẩu mới cho tài khoản của bạn",
    enterPassword: "Nhập mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu mới",
    invalidPassword: "Vui lòng nhập mật khẩu hợp lệ.",
    savePassword: "Lưu mật khẩu mới",
  },
};

function CreatePassword() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <Header />
      <section
        className="container d-flex flex-column vh-100"
        style={{ marginTop: "150px" }}
      >
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">{t.title}</h1>
                  <span>{t.subtitle}</span>
                </div>
                <form className="needs-validation" noValidate="">
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t.enterPassword}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                    />
                    <div className="invalid-feedback">
                      {t.invalidPassword}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t.confirmPassword}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                    />
                    <div className="invalid-feedback">
                      {t.invalidPassword}
                    </div>
                  </div>

                  <div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        {t.savePassword}{" "}
                        <i className="fas fa-check-circle"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default CreatePassword;
