import { Route, Routes, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { WebSocketProvider } from "./context/WebSocketProvider";
import { useAuthStore } from "./store/auth";
import { ImageProvider } from "./context/ImageContext";
import { ChatProvider } from "./context/ChatContext.jsx";
import ImageViewerModal from "./views/partials/ImageViewerModal";

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
import Chat from "./views/dashboard/Chat";
import MainWrapper from "./layouts/MainWrapper";

function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn());

  return (
    <>
      <LanguageProvider>
        <WebSocketProvider>
          <ChatProvider>
            <ImageProvider>
              <MainWrapper>
                <ImageViewerModal />
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
                  <Route
                    path="/forgot-password/"
                    element={<ForgotPassword />}
                  />
                  <Route
                    path="/create-password/"
                    element={<CreatePassword />}
                  />

                  {/* Dashboard - Protected Routes */}
                  <Route
                    path="/dashboard/"
                    element={
                      isLoggedIn ? <Dashboard /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/posts/"
                    element={isLoggedIn ? <Posts /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/add-post/"
                    element={
                      isLoggedIn ? <AddPost /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/edit-post/:id/"
                    element={
                      isLoggedIn ? <EditPost /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/comments/"
                    element={
                      isLoggedIn ? <Comments /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/notifications/"
                    element={
                      isLoggedIn ? <Notifications /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/chat/"
                    element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/categories/"
                    element={
                      isLoggedIn ? (
                        <DashboardCategory />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route
                    path="/profile/"
                    element={
                      isLoggedIn ? <Profile /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/profile/:userId/"
                    element={
                      isLoggedIn ? <Profile /> : <Navigate to="/login" />
                    }
                  />

                  {/* Pages */}
                  <Route path="/about/" element={<About />} />
                  <Route path="/contact/" element={<Contact />} />
                </Routes>
              </MainWrapper>
            </ImageProvider>
          </ChatProvider>
        </WebSocketProvider>
      </LanguageProvider>
    </>
  );
}

export default App;
