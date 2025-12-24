import { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../utils/auth";
import { useTranslation } from "react-i18next";

function Login() {
  const [bioData, setBioData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBioDataChange = (event) => {
    setBioData({
      ...bioData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setBioData({
      email: "",
      password: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(bioData.email, bioData.password);
    if (error) {
      alert(JSON.stringify(error));
      resetForm();
    } else {
      navigate("/");
    }

    setIsLoading(false);
  };

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
                  <h1 className="mb-1 fw-bold">{t('login.signIn')}</h1>
                  <span>
                    {t('login.noAccount')}
                    <Link to="/register/" className="ms-1">
                      {t('login.signUp')}
                    </Link>
                  </span>
                </div>
                {/* Form */}
                <form
                  className="needs-validation"
                  noValidate=""
                  onSubmit={handleLogin}
                >
                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      {t('login.email')}
                    </label>
                    <input
                      type="email"
                      onChange={handleBioDataChange}
                      value={bioData.email}
                      id="email"
                      className="form-control"
                      name="email"
                      placeholder="johndoe@gmail.com"
                      required=""
                    />
                    <div className="invalid-feedback">
                      {t('login.enterUsername')}
                    </div>
                  </div>
                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t('login.password')}
                    </label>
                    <input
                      type="password"
                      onChange={handleBioDataChange}
                      value={bioData.password}
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                    />
                    <div className="invalid-feedback">
                      {t('login.enterPassword')}
                    </div>
                  </div>
                  {/* Checkbox */}
                  <div className="d-lg-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberme"
                        required=""
                      />
                      <label className="form-check-label" htmlFor="rememberme">
                        {t('login.rememberMe')}
                      </label>
                      <div className="invalid-feedback">
                        {t('login.agree')}
                      </div>
                    </div>
                    <div>
                      <Link to="/forgot-password/">{t('login.forgotPassword')}</Link>
                    </div>
                  </div>
                  <div>
                    <div className="d-grid">
                      <button
                        className="btn btn-primary w-100"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="mr-2 ">{t('login.processing')}</span>
                            <i className="fas fa-spinner fa-spin" />
                          </>
                        ) : (
                          <>
                            <span className="mr-2">{t('login.signInButton')} </span>
                            <i className="fas fa-sign-in-alt" />
                          </>
                        )}
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

export default Login;
