import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { useTranslation } from "react-i18next";

function About() {
  const { t } = useTranslation();

  return (
    <>
      <Header />

      {/* <section className="pt-4 pb-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <h2>{t("about.myStory")}</h2>
              <p className="lead">{t("about.storyContent")}</p>
              <p>{t("about.storyContent2")}</p>

              {/* Service START */}
              <h3 className="mb-3 mt-5">{t("about.whatIDo")}</h3>
              <div className="row">
                {/* Service item*/}
                <div className="col-md-6 col-lg-4 mb-4">
                  <img
                    className="rounded"
                    style={{
                      width: "100%",
                      height: "170px",
                      objectFit: "cover",
                    }}
                    src="https://www.aspistrategist.org.au/wp-content/uploads/2023/11/GettyImages-467714941-1024x764.jpg"
                    alt="Card image"
                  />
                  <h4 className="mt-3">{t("about.globalNews")}</h4>
                  <p>{t("about.globalNewsContent")}</p>
                </div>
                {/* Service item*/}
                <div className="col-md-6 col-lg-4 mb-4">
                  <img
                    className="rounded"
                    style={{
                      width: "100%",
                      height: "170px",
                      objectFit: "cover",
                    }}
                    src="https://www.varletmachines.com/sites/default/files/styles/large/public/2022-04/Commercial.png?itok=jE81FZ_E"
                    alt="Card image"
                  />
                  <h4 className="mt-3">{t("about.commercialServices")}</h4>
                  <p>{t("about.commercialServicesContent")}</p>
                </div>
                {/* Service item*/}
                <div className="col-md-6 col-lg-4 mb-4">
                  <img
                    className="rounded"
                    style={{
                      width: "100%",
                      height: "170px",
                      objectFit: "cover",
                    }}
                    src="https://www.columbiasouthern.edu/media/azmjow33/fire-ems-cj-public-service.jpg"
                    alt="Card image"
                  />
                  <h4 className="mt-3">{t("about.publicServices")}</h4>
                  <p>{t("about.publicServicesContent")}</p>
                </div>
              </div>
              {/* Service END */}
            </div>{" "}
            {/* Col END */}
          </div>
        </div>
      </section> */}
      <Footer />
    </>
  );
}

export default About;
