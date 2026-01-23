import React from "react";
import UserHoverCard from "../../partials/UserHoverCard";

const TopWriters = ({ posts, t }) => {
  return (
    <section className="py-5 bg-light-subtle">
      <div className="container">
        <div className="row align-items-center mb-4">
          <div className="col-lg-6">
            <h3 className="fw-bold m-0">
              {t("index.top_writers", { defaultValue: "Top Writers" })} ✍️
            </h3>
            <p className="text-muted m-0">
              {t("index.top_writers_desc", {
                defaultValue: "Discover our most occurring writers.",
              })}
            </p>
          </div>
        </div>

        <div className="row g-3">
          {(() => {
            const authorMap = new Map();
            posts.forEach((post) => {
              if (post.user) {
                const id = post.user.id || post.user.username;
                if (!authorMap.has(id)) {
                  authorMap.set(id, { ...post.user, count: 0, views: 0 });
                }
                const author = authorMap.get(id);
                author.count += 1;
                author.views += post.view;
              }
            });
            const topAuthors = Array.from(authorMap.values())
              .sort((a, b) => b.views - a.views)
              .slice(0, 4);

            return topAuthors.map((author) => (
              <div
                className="col-md-6 col-lg-3"
                key={author.id || author.username}
              >
                <div
                  className="card h-100 border-0 shadow-sm p-3 text-center hover-up"
                  style={{ overflow: "visible" }}
                >
                  <UserHoverCard userId={author.id}>
                    <div
                      className="position-relative mx-auto mb-3"
                      style={{
                        width: "80px",
                        height: "80px",
                        cursor: "pointer",
                      }}
                    >
                      {author.image ? (
                        <img
                          src={author.image}
                          className="rounded-circle object-fit-cover w-100 h-100 border border-3 border-light shadow-sm"
                          alt={author.username}
                        />
                      ) : (
                        <div className="w-100 h-100 rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center border border-3 border-light shadow-sm">
                          <span className="fs-3 fw-bold text-primary">
                            {author.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-success border border-white">
                        <i className="fas fa-check-circle fa-xs"></i>
                      </span>
                    </div>
                  </UserHoverCard>
                  <h6 className="fw-bold text-dark mb-1">{author.username}</h6>
                  <small className="text-muted d-block mb-3">
                    {author.bio ||
                      t("index.content_creator", {
                        defaultValue: "Content Creator",
                      })}
                  </small>

                  <div className="d-flex justify-content-around border-top pt-3 w-100 mt-auto">
                    <div>
                      <span className="fw-bold d-block text-dark">
                        {author.count}
                      </span>
                      <small
                        className="text-muted"
                        style={{ fontSize: "12px" }}
                      >
                        {t("index.articles", { defaultValue: "Articles" })}
                      </small>
                    </div>
                    <div>
                      <span className="fw-bold d-block text-dark">
                        {author.views}
                      </span>
                      <small
                        className="text-muted"
                        style={{ fontSize: "12px" }}
                      >
                        {t("index.views", { defaultValue: "Views" })}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </section>
  );
};

export default TopWriters;
