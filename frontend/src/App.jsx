import { Route, Routes, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { useAuthStore } from "./store/auth";

import Index from "./views/core/Index";
import Detail from "./views/core/Detail";
import Search from "./views/core/Search";
import Category from "./views/core/Category";
import DashboardCategory from "./views/dashboard/Category";
import CategoryDetail from "./views/category/CategoryDetail";
import About from "./views/pages/About";
import Contact from "./views/pages/Contact";
import LandingPage from "./views/pages/LandingPage";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreatePassword from "./views/auth/CreatePassword";
import Dashboard from "./views/dashboard/Dashboard";
import Posts from "./views/dashboard/Posts";
import AddPost from "./views/dashboard/AddPost";
import EditPost from "./views/dashboard/EditPost";
import Comments from "./views/dashboard/Comments";
import Notifications from "./views/dashboard/Notifications";
import Profile from "./views/dashboard/Profile";
import MainWrapper from "./layouts/MainWrapper";

function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn());

  return (
    <>
      <LanguageProvider>
        <WebSocketProvider>
          <MainWrapper>
            <Routes>
              {/* Route Protection Logic */}
              <Route
                path="/"
                element={isLoggedIn ? <Index /> : <LandingPage />}
              />

              {/* Redirect Login to Home if already logged in */}
              <Route
                path="/login/"
                element={isLoggedIn ? <Navigate to="/" /> : <Login />}
              />

              <Route path="/post/:slug/" element={<Detail />} />
              <Route path="/category/" element={<Category />} />
              <Route path="/category/:slug/" element={<CategoryDetail />} />
              <Route path="/search/" element={<Search />} />

              {/* Authentication */}
              <Route path="/register/" element={<Register />} />
              {/* /login/ handled above */}
              <Route path="/logout/" element={<Logout />} />
              <Route path="/forgot-password/" element={<ForgotPassword />} />
              <Route path="/create-password/" element={<CreatePassword />} />

              {/* Dashboard */}
              <Route path="/dashboard/" element={<Dashboard />} />
              <Route path="/posts/" element={<Posts />} />
              <Route path="/add-post/" element={<AddPost />} />
              <Route path="/edit-post/:id/" element={<EditPost />} />
              <Route path="/comments/" element={<Comments />} />
              <Route path="/notifications/" element={<Notifications />} />
              <Route path="/categories/" element={<DashboardCategory />} />
              <Route path="/profile/" element={<Profile />} />
              <Route path="/profile/:userId/" element={<Profile />} />

              {/* Pages */}
              <Route path="/about/" element={<About />} />
              <Route path="/contact/" element={<Contact />} />
            </Routes>
          </MainWrapper>
        </WebSocketProvider>
      </LanguageProvider>
    </>
  );
}

export default App;
