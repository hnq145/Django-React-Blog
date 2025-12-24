import { useState, useEffect, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import useUserData from "../../plugin/useUserData";
import apiInstance from "../../utils/axios";
import Toast from "../../plugin/Toast";
import { useTranslation } from "react-i18next";

function Profile() {
  const [profileData, setProfileData] = useState({
    image: null,
    fullName: "",
    about: "",
    bio: "",
    country: "",
  });
  const user_id = useUserData()?.user_id;
  const [imagePreview, setImagePreview] = useState("");
  const { t } = useTranslation();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiInstance.get(`user/profile/${user_id}/`);
      setProfileData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [user_id]);

  const handleFileChange = (event) => {
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
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = async () => {
    if (!user_id) {
      Toast("error", t("profile.loggedInToUpdate"));
      return;
    }
    const res = await apiInstance.get(`user/profile/${user_id}/`);
    const formdata = new FormData();
    console.log(profileData.image);
    console.log(imagePreview);

    if (profileData.image && profileData.image !== res.data.image) {
      formdata.append("image", profileData.image);
    }

    formdata.append("full_name", profileData.fullName);
    formdata.append("about", profileData.about);
    formdata.append("country", profileData.country);
    formdata.append("bio", profileData.bio);

    try {
      await apiInstance.patch(`user/profile/${user_id}/`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Toast("success", t("profile.profileUpdated"));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchProfile();
    }
  }, [fetchProfile]);

  console.log(profileData?.full_name);

  return (
    <>
      <Header />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-12 col-md-8 col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="mb-0">{t("profile.profileDetails")}</h3>
                  <p className="mb-0">
                    {t("profile.manageAccount")}
                  </p>
                </div>
                <div className="card-body">
                  <div className="d-lg-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center mb-4 mb-lg-0">
                      <img
                        src={imagePreview || profileData.image}
                        id="img-uploaded"
                        className="avatar-xl rounded-circle"
                        alt="avatar"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="ms-3">
                        <h4 className="mb-0">{t("profile.yourAvatar")}</h4>
                        <p className="mb-0">
                          {t("profile.avatarHelp")}
                        </p>
                        <input
                          type="file"
                          className="form-control mt-3"
                          name="image"
                          onChange={handleFileChange}
                          id=""
                        />
                      </div>
                    </div>
                  </div>
                  <hr className="my-5" />
                  <div>
                    <h4 className="mb-0 fw-bold">
                      <i className="fas fa-user-gear me-2"></i>{t("profile.personalDetails")}
                    </h4>
                    <p className="mb-4 mt-2">
                      {t("profile.editPersonalInfo")}
                    </p>
                    <div className="row gx-3">
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="fname">
                          {t("profile.fullName")}
                        </label>
                        <input
                          onChange={handleProfileChange}
                          name="full_name"
                          type="text"
                          id="fname"
                          className="form-control"
                          placeholder={t("profile.enterFullName")}
                          required=""
                          value={profileData?.full_name || ""}
                        />
                        <div className="invalid-feedback">
                          {t("profile.enterFirstName")}
                        </div>
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="fname">
                          {t("profile.bio")}
                        </label>
                        <input
                          onChange={handleProfileChange}
                          name="bio"
                          value={profileData?.bio || ""}
                          type="text"
                          id="fname"
                          className="form-control"
                          placeholder={t("profile.enterBio")}
                          required=""
                        />
                        <div className="invalid-feedback">
                          {t("profile.enterFirstName")}
                        </div>
                      </div>
                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="lname">
                          {t("profile.aboutMe")}
                        </label>
                        <textarea
                          onChange={handleProfileChange}
                          value={profileData?.about || ""}
                          placeholder={t("profile.enterAboutMe")}
                          id=""
                          cols="30"
                          rows="5"
                          className="form-control"
                        ></textarea>
                        <div className="invalid-feedback">
                          {t("profile.enterLastName")}
                        </div>
                      </div>

                      <div className="mb-3 col-12 col-md-12">
                        <label className="form-label" htmlFor="editCountry">
                          {t("profile.country")}
                        </label>
                        <input
                          onChange={handleProfileChange}
                          name="country"
                          value={profileData?.country || ""}
                          type="text"
                          id="country"
                          className="form-control"
                          placeholder={t("profile.enterCountry")}
                          required=""
                        />
                        <div className="invalid-feedback">
                          {t("profile.chooseCountry")}
                        </div>
                      </div>
                      <div className="col-12 mt-4">
                        <button
                          onClick={handleFormSubmit}
                          className="btn btn-primary"
                          type="button"
                        >
                          {t("profile.updateProfile")} <i className="fas fa-check-circle"></i>
                        </button>
                      </div>
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