import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useTranslation } from "react-i18next";

function Contact() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-9 mx-auto text-center">
              <h1 className="fw-bold">{t("contact.contactMe")}</h1>
            </div>
          </div>
        </div>
      </section>
      {/* =======================
Inner intro END */}
      {/* =======================
Contact info START */}
      <section className="pt-4">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <div className="row mt-5">
                <div className="col-sm-6 mb-5 mb-sm-0">
                  <h3>{t("contact.addressInfo")}</h3>
                  <address>{t("contact.address")}</address>
                  <p>
                    {t("contact.call")}:{" "}
                    <a href="#" className="text-reset">
                      <u>+123 4567 890 (Toll-free)</u>
                    </a>
                  </p>
                  <p>
                    {t("contact.email")}:{" "}
                    <a href="#" className="text-reset">
                      <u>quyhoang1452003@gmail.com</u>
                    </a>
                  </p>
                  <p>
                    {t("contact.supportTime")}
                    <br />
                    {t("contact.supportTimeRange")}
                  </p>
                </div>
                <div className="col-sm-6">
                  <h3>{t("contact.contactInfo")}</h3>
                  <p>{t("contact.contactInfoContent")}</p>
                  <address>{t("contact.address")}</address>
                  <p>
                    {t("contact.call")}:{" "}
                    <a href="#" className="text-reset">
                      <u>+123 4567 890 (Toll-free)</u>
                    </a>
                  </p>
                  <p>
                    {t("contact.email")}:{" "}
                    <a href="#" className="text-reset">
                      <u>quyhoang1452003@gmail.com</u>
                    </a>
                  </p>
                  <p>
                    {t("contact.supportTime")}
                    <br />
                    {t("contact.supportTimeRange")}
                  </p>
                </div>
              </div>
              <hr className="my-5" />
              <div className="row mb-5">
                <div className="col-12">
                  <h2 className="fw-bold">{t("contact.sendMessage")}</h2>
                  <p>{t("contact.sendMessageContent")}</p>
                  {/* Form START */}
                  <form
                    className="contact-form"
                    id="contact-form"
                    name="contactform"
                    method="POST"
                  >
                    {/* Main form */}
                    <div className="row">
                      <div className="col-md-6">
                        {/* name */}
                        <div className="mb-3">
                          <input
                            required=""
                            id="con-name"
                            name="name"
                            type="text"
                            className="form-control"
                            placeholder={t("contact.name")}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        {/* email */}
                        <div className="mb-3">
                          <input
                            required=""
                            id="con-email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder={t("contact.email")}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        {/* Subject */}
                        <div className="mb-3">
                          <input
                            required=""
                            id="con-subject"
                            name="subject"
                            type="text"
                            className="form-control"
                            placeholder={t("contact.subject")}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        {/* Message */}
                        <div className="mb-3">
                          <textarea
                            required=""
                            id="con-message"
                            name="message"
                            cols={40}
                            rows={6}
                            className="form-control"
                            placeholder={t("contact.message")}
                            defaultValue={""}
                          />
                        </div>
                      </div>
                      {/* submit button */}
                      <div className="col-md-12 text-start">
                        <button className="btn btn-primary w-100" type="submit">
                          {t("contact.sendMessageButton")}{" "}
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                  {/* Form END */}
                </div>
              </div>
            </div>{" "}
            {/* Col END */}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Contact;
