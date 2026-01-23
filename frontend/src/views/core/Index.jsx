import { useEffect, useState, useCallback } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import RightSidebar from "../partials/RightSidebar";
import apiInstance from "../../utils/axios";
import { useTranslation } from "react-i18next";

// Import Home Sub-components
import HeroSection from "../partials/home/HeroSection";
import CategorySection from "../partials/home/CategorySection";
import LatestPosts from "../partials/home/LatestPosts";
import TopWriters from "../partials/home/TopWriters";
import Newsletter from "../partials/home/Newsletter";

function Index() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [category, setCategory] = useState([]);
  const [feedType, setFeedType] = useState("latest");
  const { t, i18n } = useTranslation();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "post/lists/";
      if (feedType === "following") {
        endpoint = "post/lists/following/";
      }

      const response_post = await apiInstance.get(endpoint);
      const response_category = await apiInstance.get("post/category/list/");

      let postData = response_post.data;

      const sortedPosts = [...postData].sort(
        (a, b) => b.view + b.likes - (a.view + a.likes),
      );

      setPosts(postData);
      setSortedPosts(postData);
      setTrendingPosts(sortedPosts);
      setCategory(response_category.data);
    } catch (error) {
      console.error(error);
      setPosts([]); // clear posts on error or empty
      setSortedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [feedType]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSortChange = (e) => {
    const order = e.target.value;
    let newSortedPosts = [...posts];

    if (order === "newest") {
      newSortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (order === "oldest") {
      newSortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (order === "a-z") {
      newSortedPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (order === "z-a") {
      newSortedPosts.sort((a, b) => b.title.localeCompare(a.title));
    }
    setSortedPosts(newSortedPosts);
  };

  const latestItemsPerPage = 8;
  const [latestCurrentPage, setLatestCurrentPage] = useState(1);
  const indexOfLastLatestItem = latestCurrentPage * latestItemsPerPage;
  const indexOfFirstLatestItem = indexOfLastLatestItem - latestItemsPerPage;

  const latestPostItems = sortedPosts?.slice(
    indexOfFirstLatestItem,
    indexOfLastLatestItem,
  );

  const totalLatestPages = Math.ceil(sortedPosts?.length / latestItemsPerPage);
  const latestPageNumbers = Array.from(
    { length: totalLatestPages },
    (_, index) => index + 1,
  );

  // Trending Section Helpers
  const featuredPost = trendingPosts.length > 0 ? trendingPosts[0] : null;
  const sideTrendingPosts =
    trendingPosts.length > 1 ? trendingPosts.slice(1, 4) : [];

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <RightSidebar />

      <HeroSection
        featuredPost={featuredPost}
        sideTrendingPosts={sideTrendingPosts}
        t={t}
        i18n={i18n}
      />

      <CategorySection category={category} t={t} />

      <LatestPosts
        latestPostItems={latestPostItems}
        loading={loading}
        feedType={feedType}
        setFeedType={setFeedType}
        handleSortChange={handleSortChange}
        latestCurrentPage={latestCurrentPage}
        setLatestCurrentPage={setLatestCurrentPage}
        totalLatestPages={totalLatestPages}
        latestPageNumbers={latestPageNumbers}
        t={t}
        i18n={i18n}
      />

      <TopWriters posts={posts} t={t} />

      <Newsletter t={t} />

      <Footer />
    </div>
  );
}

export default Index;
