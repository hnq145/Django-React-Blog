import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../utils/auth";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const [bioData, setBioData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Only redirect if successful, but App.jsx might handle the protection too.
  // We'll stick to the login logic here.

  const handleBioDataChange = (event) => {
    setBioData({
      ...bioData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(bioData.email, bioData.password);
    if (error) {
      alert(JSON.stringify(error));
    } else {
      // Login successful, the auth store will update.
      // App.jsx will check isLoggedIn and redirect or show Index.
      // But we can also force navigate to be sure.
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-center">
          {/* Left Column: Branding */}
          <div className="col-md-7 mb-5 mb-md-0 text-center text-md-start pe-md-5">
            <h1
              className="fw-bold text-primary display-3"
              style={{ color: "#1877f2" }}
            >
              AI Blog
            </h1>
            <h2
              className="h4 fw-normal mt-3 mb-4"
              style={{ fontSize: "28px", lineHeight: "32px", width: "auto" }}
            >
              {t(
                "landing.slogan",
                "Khám phá sức mạnh của AI trong việc sáng tạo và chia sẻ kiến thức."
              )}
            </h2>
            <p className="fs-5 text-muted">
              {t(
                "landing.description",
                "Tham gia cộng đồng và trải nghiệm các tính năng hỗ trợ viết bài, tóm tắt và phân tích nội dung thông minh."
              )}
            </p>
          </div>

          {/* Right Column: Login Form */}
          <div className="col-md-5" style={{ maxWidth: "420px" }}>
            <div
              className="card shadow border-0"
              style={{ borderRadius: "8px" }}
            >
              <div className="card-body p-4">
                <form onSubmit={handleLogin} className="d-grid gap-3">
                  <div>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder={t("login.email", "Email hoặc số điện thoại")}
                      name="email"
                      value={bioData.email}
                      onChange={handleBioDataChange}
                      required
                      style={{ fontSize: "17px" }}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder={t("login.password", "Mật khẩu")}
                      name="password"
                      value={bioData.password}
                      onChange={handleBioDataChange}
                      required
                      style={{ fontSize: "17px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg fw-bold"
                    style={{
                      fontSize: "20px",
                      backgroundColor: "#1877f2",
                      borderColor: "#1877f2",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      t("login.signInButton", "Đăng nhập")
                    )}
                  </button>

                  <div className="text-center my-2">
                    <Link
                      to="/forgot-password/"
                      className="text-decoration-none"
                      style={{ fontSize: "14px", color: "#1877f2" }}
                    >
                      {t("login.forgotPassword", "Quên mật khẩu?")}
                    </Link>
                  </div>

                  <hr className="my-2" />

                  <div className="text-center mt-2">
                    <Link
                      to="/register/"
                      className="btn btn-success btn-lg fw-bold text-white"
                      style={{
                        fontSize: "17px",
                        backgroundColor: "#42b72a",
                        borderColor: "#42b72a",
                      }}
                    >
                      {t("login.signUp", "Tạo tài khoản mới")}
                    </Link>
                  </div>
                </form>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p style={{ fontSize: "14px" }}>
                <strong>{t("landing.createPage", "Tạo Trang")}</strong>{" "}
                {t(
                  "landing.forCelebrity",
                  "dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
