import { useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../utils/auth";
import { useTranslation } from "react-i18next";

function Register() {
  const [bioData, setBioData] = useState({
    full_name: "",
    email: "",
    password: "",
    password2: "",
  });

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
      full_name: "",
      email: "",
      password: "",
      password2: "",
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await register(
      bioData.full_name,
      bioData.email,
      bioData.password,
      bioData.password2
    );

    if (error) {
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
                  <h1 className="mb-1 fw-bold">{t('register.signUp')}</h1>
                  <span>
                    {t('register.haveAccount')}
                    <Link to="/login/" className="ms-1">
                      {t('register.signIn')}
                    </Link>
                  </span>
                </div>
                {/* Form */}
                <form
                  onSubmit={handleRegister}
                  className="needs-validation"
                  noValidate=""
                >
                  {/* Username */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      {t('register.fullName')}
                    </label>
                    <input
                      onChange={handleBioDataChange}
                      value={bioData.full_name}
                      type="text"
                      id="full_name"
                      className="form-control"
                      name="full_name"
                      placeholder="John Doe"
                      required=""
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      {t('register.email')}
                    </label>
                    <input
                      onChange={handleBioDataChange}
                      value={bioData.email}
                      type="email"
                      id="email"
                      className="form-control"
                      name="email"
                      placeholder="johndoe@gmail.com"
                      required=""
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t('register.password')}
                    </label>
                    <input
                      onChange={handleBioDataChange}
                      value={bioData.password}
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="**************"
                      required=""
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t('register.confirmPassword')}
                    </label>
                    <input
                      onChange={handleBioDataChange}
                      value={bioData.password2}
                      type="password"
                      id="password"
                      className="form-control"
                      name="password2"
                      placeholder="**************"
                      required=""
                    />
                  </div>
                  <div>
                    <div className="d-grid">
                      {isLoading === true ? (
                        <button
                          disabled
                          type="submit"
                          className="btn btn-primary"
                        >
                          {t('register.processing')} <i className="fas fa-spinner fa-spin"></i>
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          {t('register.signUpButton')} <i className="fas fa-user-plus"></i>
                        </button>
                      )}
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

export default Register;
