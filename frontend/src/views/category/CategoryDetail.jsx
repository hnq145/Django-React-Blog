import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import apiInstance from '../../utils/axios';
import { useTranslation } from 'react-i18next';

function CategoryDetail() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState({});
  const { slug } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiInstance.get(`post/category/posts/${slug}/`);
        setPosts(response.data);
        if (response.data.length > 0) {
          setCategory(response.data[0].category);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [slug]);

  return (
    <div>
      <Header />
      <section className="p-0">
        <div className="container">
          <div className="row">
            <div className="col">
              <h2 className="text-start d-block mt-1">
                <i className="bi bi-grid-fill"></i> {t(`category.${category?.title?.toLowerCase()}`)}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-4 pb-0 mt-4">
        <div className="container">
          <div className="row">
            {posts.map((post) => (
              <div key={post.id} className="col-sm-6 col-lg-3">
                <div className="card mb-4">
                  <div className="card-fold position-relative">
                    <img className="card-img" style={{ width: "100%", height: "160px", objectFit: "cover" }} src={post.image} alt={post.title} />
                  </div>
                  <div className="card-body px-3 pt-3">
                    <h4 className="card-title">
                      <Link to={`/post/${post.slug}/`} className="btn-link text-reset stretched-link fw-bold text-decoration-none">
                        {post.title}
                      </Link>
                    </h4>
                    <ul className="mt-3 list-style-none" style={{ listStyle: "none" }}>
                      <li>
                        <Link to="#" className="text-dark text-decoration-none">
                          <i className="fas fa-user"></i> {post.profile?.full_name}
                        </Link>
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-calendar"></i> {new Date(post.date).toLocaleDateString()}
                      </li>
                      <li className="mt-2">
                        <i className="fas fa-eye"></i> {post.view} Views
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default CategoryDetail;
