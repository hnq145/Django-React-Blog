import { useState, useEffect, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import useUserData from "../../plugin/useUserData";
import apiInstance from "../../utils/axios";
import Toast from "../../plugin/Toast";
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
    } catch (error) {
      console.error(error);
    }
  }, [isOwnProfile, userId]);

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
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
                          <i className="fas fa-user-minus me-1"></i> Unfollow
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-1"></i> Follow
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
                      <span className="text-muted">Posts</span>
                    </div>
                    <div className="col-4">
                      <h4 className="fw-bold">
                        {profileData.followers_count || 0}
                      </h4>
                      <span className="text-muted">Followers</span>
                    </div>
                    <div className="col-4">
                      <h4 className="fw-bold">
                        {profileData.following_count || 0}
                      </h4>
                      <span className="text-muted">Following</span>
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
                </div>
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
