import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useLanguage } from "../../context/LanguageContext";

const translations = {
  en: {
    title: "Forgot Password",
    subtitle: "Let's help you get back into your account",
    email: "Email Address",
    reset: "Reset Password",
  },
  vi: {
    title: "Quên mật khẩu",
    subtitle: "Hãy để chúng tôi giúp bạn lấy lại tài khoản.",
    email: "Địa chỉ email",
    reset: "Đặt lại mật khẩu",
  },
};

function ForgotPassword() {
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
                    <label htmlFor="email" className="form-label">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      placeholder="johndoe@gmail.com"
                      required=""
                    />
                  </div>

                  <div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        {t.reset} <i className="fas fa-arrow-right"></i>
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

export default ForgotPassword;
