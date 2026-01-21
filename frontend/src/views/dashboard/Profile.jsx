import { useState, useEffect, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import Sidebar from "../partials/Sidebar";
import useUserData from "../../plugin/useUserData";
import apiInstance from "../../utils/axios";
import Toast from "../../plugin/Toast";
import Moment from "../../plugin/Moment";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

function Profile() {
  const [profileData, setProfileData] = useState({
    image: null,
    full_name: "",
    about: "",
    bio: "",
    country: "",
    stats: { posts: 0, followers: 0, following: 0 },
  });
  const [userPosts, setUserPosts] = useState([]);
  const { userId } = useParams();
  const loggedInUserId = useUserData()?.user_id; // Rename to avoid confusion with param
  // If no userId param, or it matches logged in user, it is own profile
  const isOwnProfile = !userId || (loggedInUserId && userId == loggedInUserId);

  const [imagePreview, setImagePreview] = useState("");
  const { t } = useTranslation();

  const fetchProfile = useCallback(async () => {
    try {
      let url = `user/profile/`;
      if (!isOwnProfile && userId) {
        url = `user/profile/${userId}/`;
      }
      const response = await apiInstance.get(url);
      setProfileData(response.data);
      if (response.data.image) {
        setImagePreview(response.data.image);
      }

      // Fetch Author Posts
      const targetUserId = !isOwnProfile && userId ? userId : loggedInUserId;
      if (targetUserId) {
        const postRes = await apiInstance.get(
          `post/lists/author/${targetUserId}/`,
        );
        setUserPosts(postRes.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [isOwnProfile, userId, loggedInUserId]);

  const handleFileChange = (event) => {
    if (!isOwnProfile) return;
    const selectedFile = event.target.files[0];
    setProfileData({
      ...profileData,
      [event.target.name]: selectedFile,
    });

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProfileChange = (event) => {
    if (!isOwnProfile) return;
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = async () => {
    if (!isOwnProfile) return;
    const formdata = new FormData();
    if (profileData.image instanceof File) {
      formdata.append("image", profileData.image);
    }
    formdata.append("full_name", profileData.full_name || "");
    formdata.append("about", profileData.about || "");
    formdata.append("country", profileData.country || "");
    formdata.append("bio", profileData.bio || "");

    try {
      await apiInstance.patch(`user/profile/`, formdata);
      fetchProfile();
      Toast("success", t("profile.profileUpdated"));
    } catch (error) {
      console.error(error);
      Toast("error", "Failed to update profile.");
    }
  };

  const handleFollow = async () => {
    try {
      const response = await apiInstance.post(`user/follow/`, {
        user_id: userId,
      });
      Toast("success", response.data.message);
      fetchProfile();
    } catch (error) {
      console.error(error);
      Toast("error", error.response?.data?.message || "Error following user");
    }
  };

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      Toast("error", t("profile.passwordsDoNotMatch", "Mật khẩu không khớp"));
      return;
    }
    try {
      await apiInstance.post(`user/change-password/`, passwordData);
      Toast(
        "success",
        t("profile.passwordChangedSuccess", "Đổi mật khẩu thành công"),
      );
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (error) {
      console.error(error);
      if (error.response?.data?.old_password) {
        Toast("error", t("profile.wrongOldPassword", "Mật khẩu cũ không đúng"));
      } else if (error.response?.data?.new_password) {
        Toast("error", error.response.data.new_password[0]);
      } else {
        Toast(
          "error",
          t("profile.passwordChangeFailed", "Đổi mật khẩu thất bại"),
        );
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            {isOwnProfile && <Sidebar />}
            <div
              className={`col-md-8 col-12 ${isOwnProfile ? "col-lg-9" : "col-lg-12"}`}
            >
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">
                      {isOwnProfile
                        ? t("profile.profileDetails")
                        : profileData.full_name}
                    </h3>
                    <p className="mb-0">
                      {isOwnProfile
                        ? t("profile.manageAccount")
                        : profileData.bio}
                    </p>
                  </div>
                  {!isOwnProfile && (
                    <button
                      className={`btn ${profileData.is_following ? "btn-outline-danger" : "btn-primary"}`}
                      onClick={handleFollow}
                    >
                      {profileData.is_following ? (
                        <>
                          <i className="fas fa-user-minus me-1"></i>{" "}
                          {t("profile.unfollow", "Hủy theo dõi")}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-1"></i>{" "}
                          {t("profile.follow", "Theo dõi")}
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {/* Stats Section */}
                  <div className="row text-center mb-4">
                    <div className="col-4">
                      <h4 className="fw-bold">{profileData.post_count || 0}</h4>
                      <span className="text-muted">
                        {t("profile.posts", "Bài viết")}
                      </span>
                    </div>
                    <div className="col-4">
                      <h4 className="fw-bold">
                        {profileData.followers_count || 0}
                      </h4>
                      <span className="text-muted">
                        {t("profile.followers", "Người theo dõi")}
                      </span>
                    </div>
                    <div className="col-4">
                      <h4 className="fw-bold">
                        {profileData.following_count || 0}
                      </h4>
                      <span className="text-muted">
                        {t("profile.following", "Đang theo dõi")}
                      </span>
                    </div>
                  </div>
                  <div className="d-lg-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center mb-4 mb-lg-0">
                      <img
                        src={
                          imagePreview ||
                          profileData.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || "User")}&background=random&color=fff&size=128`
                        }
                        className="avatar-xl rounded-circle"
                        alt="avatar"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      {isOwnProfile && (
                        <div className="ms-3">
                          <h4 className="mb-0">{t("profile.yourAvatar")}</h4>
                          <p className="mb-0">{t("profile.avatarHelp")}</p>
                          <input
                            type="file"
                            className="form-control mt-3"
                            name="image"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <hr className="my-5" />

                  {/* Badges Section */}
                  {profileData?.badges?.length > 0 && (
                    <div className="mb-5">
                      <h4 className="mb-3 fw-bold">
                        <i className="fas fa-medal me-2"></i>
                        {t("profile.badges", "Danh hiệu")}
                      </h4>
                      <div className="d-flex flex-wrap gap-3">
                        {profileData.badges.map((badge, index) => (
                          <div
                            key={index}
                            className="text-center p-3 rounded shadow-sm border"
                            style={{ minWidth: "100px", background: "#f8f9fa" }}
                            title={badge.description}
                          >
                            <div className="fs-1 mb-2 text-warning">
                              <i className={badge.icon}></i>
                            </div>
                            <h6 className="fw-bold mb-0 small">{badge.name}</h6>
                          </div>
                        ))}
                      </div>
                      <hr className="mt-4" />
                    </div>
                  )}

                  <div>
                    <h4 className="mb-0 fw-bold">
                      <i className="fas fa-user-gear me-2"></i>
                      {t("profile.personalDetails")}
                    </h4>
                    <p className="mb-4 mt-2">{t("profile.editPersonalInfo")}</p>
                    <div className="row gx-3">
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label">
                          {t("profile.fullName")}
                        </label>
                        {isOwnProfile ? (
                          <input
                            onChange={handleProfileChange}
                            name="full_name"
                            type="text"
                            className="form-control"
                            value={profileData?.full_name || ""}
                          />
                        ) : (
                          <p className="form-control-plaintext fw-bold">
                            {profileData.full_name}
                          </p>
                        )}
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label">{t("profile.bio")}</label>
                        {isOwnProfile ? (
                          <input
                            onChange={handleProfileChange}
                            name="bio"
                            value={profileData?.bio || ""}
                            type="text"
                            className="form-control"
                          />
                        ) : (
                          <p className="form-control-plaintext">
                            {profileData.bio}
                          </p>
                        )}
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label">
                          {t("profile.aboutMe")}
                        </label>
                        {isOwnProfile ? (
                          <textarea
                            onChange={handleProfileChange}
                            name="about"
                            value={profileData?.about || ""}
                            cols="30"
                            rows="5"
                            className="form-control"
                          ></textarea>
                        ) : (
                          <p className="form-control-plaintext">
                            {profileData.about}
                          </p>
                        )}
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label">
                          {t("profile.country")}
                        </label>
                        {isOwnProfile ? (
                          <input
                            onChange={handleProfileChange}
                            name="country"
                            value={profileData?.country || ""}
                            type="text"
                            className="form-control"
                          />
                        ) : (
                          <p className="form-control-plaintext">
                            {profileData.country}
                          </p>
                        )}
                      </div>
                      {isOwnProfile && (
                        <div className="col-12 mt-4">
                          <button
                            onClick={handleFormSubmit}
                            className="btn btn-primary"
                            type="button"
                          >
                            {t("profile.updateProfile")}{" "}
                            <i className="fas fa-check-circle"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="mt-5">
                      <h4 className="mb-0 fw-bold">
                        <i className="fas fa-lock me-2"></i>
                        {t("profile.changePassword", "Đổi mật khẩu")}
                      </h4>
                      <p className="mb-4 mt-2">
                        {t(
                          "profile.changePasswordDesc",
                          "Thay đổi mật khẩu tài khoản của bạn.",
                        )}
                      </p>
                      <div className="row gx-3">
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label">
                            {t("profile.oldPassword", "Mật khẩu cũ")}
                          </label>
                          <input
                            onChange={handlePasswordChange}
                            name="old_password"
                            type="password"
                            className="form-control"
                            value={passwordData.old_password}
                          />
                        </div>
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label">
                            {t("profile.newPassword", "Mật khẩu mới")}
                          </label>
                          <input
                            onChange={handlePasswordChange}
                            name="new_password"
                            type="password"
                            className="form-control"
                            value={passwordData.new_password}
                          />
                        </div>
                        <div className="mb-3 col-12 col-md-12">
                          <label className="form-label">
                            {t(
                              "profile.confirmPassword",
                              "Xác nhận mật khẩu mới",
                            )}
                          </label>
                          <input
                            onChange={handlePasswordChange}
                            name="confirm_new_password"
                            type="password"
                            className="form-control"
                            value={passwordData.confirm_new_password}
                          />
                        </div>
                        <div className="col-12 mt-4">
                          <button
                            onClick={handlePasswordSubmit}
                            className="btn btn-secondary"
                            type="button"
                          >
                            {t("profile.changePasswordBtn", "Đổi mật khẩu")}{" "}
                            <i className="fas fa-key"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* User Posts Section */}
              <div className="mt-5">
                <h3 className="mb-4 fw-bold">
                  {t("profile.posts", "Bài viết")}
                </h3>
                {userPosts?.length > 0 ? (
                  <div className="row g-4">
                    {userPosts.map((p) => (
                      <div className="col-sm-6 col-lg-4" key={p.id}>
                        <div className="card h-100 border-0 shadow-sm hover-up">
                          <Link
                            to={`/post/${p.slug}/`}
                            className="text-decoration-none text-dark"
                          >
                            <img
                              src={p.image}
                              className="card-img-top object-fit-cover"
                              style={{ height: "200px" }}
                              alt={p.title}
                            />
                          </Link>
                          <div className="card-body">
                            <h5 className="card-title fw-bold">
                              <Link
                                to={`/post/${p.slug}/`}
                                className="text-decoration-none text-dark"
                              >
                                {p.title}
                              </Link>
                            </h5>
                            <p className="card-text text-muted small">
                              {Moment(p.date)} • {p.view} {t("dashboard.views")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">
                    {t("profile.noPosts", "Chưa có bài viết nào.")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Profile;
