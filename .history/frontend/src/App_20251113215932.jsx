import { Route, Routes, BrowserRouter } from "react-router-dom";
// Import AuthProvider (File quan trọng nhất để sửa lỗi API)
import { AuthProvider } from "context/AuthContext"; // Sửa: Xóa './'

// (Các import component của bạn - Đã sửa lỗi đường dẫn)
import Index from "views/core/Index"; // Sửa: Xóa './'
import Detail from "views/core/Detail"; // Sửa: Xóa './'
import Search from "views/core/Search"; // Sửa: Xóa './'
import Category from "views/core/Category"; // Sửa: Xóa './'
import About from "views/pages/About"; // Sửa: Xóa './'
import Contact from "views/pages/Contact"; // Sửa: Xóa './'
import Register from "views/auth/Register"; // Sửa: Xóa './'
import Login from "views/auth/Login"; // Sửa: Xóa './'
import Logout from "views/auth/Logout"; // Sửa: Xóa './'
import ForgotPassword from "views/auth/ForgotPassword"; // Sửa: Xóa './'
import CreatePassword from "views/auth/CreatePassword"; // Sửa: Xóa './'
import Dashboard from "views/dashboard/Dashboard"; // Sửa: Xóa './'
import Posts from "views/dashboard/Posts"; // Sửa: Xóa './'
import AddPost from "views/dashboard/AddPost"; // Sửa: Xóa './'
import EditPost from "views/dashboard/EditPost"; // Sửa: Xóa './'
import Comments from "views/dashboard/Comments"; // Sửa: Xóa './'
import Notifications from "views/dashboard/Notifications"; // Sửa: Xóa './'
import Profile from "views/dashboard/Profile"; // Sửa: Xóa './'
import MainWrapper from "layouts/MainWrapper"; // Sửa: Sửa lại hoàn toàn đường dẫn

function App() {
  return (
    <>
      <BrowserRouter>
        {/* BỌC AuthProvider BÊN NGOÀi MainWrapper */}
        {/* Điều này cung cấp Context (user, api) cho toàn bộ ứng dụng */}
        <AuthProvider>
          <MainWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Sửa lại Route Detail của bạn để khớp với slug */}
              <Route path="/post/:slug/" element={<Detail />} /> 
              <Route path="/category/" element={<Category />} />
              <Route path="/search/" element={<Search />} />

              {/* Authentication */}
              <Route path="/register/" element={<Register />} />
              <Route path="/login/" element={<Login />} />
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
              <Route path="/profile/" element={<Profile />} />

              {/* Pages */}
              <Route path="/about/" element={<About />} />
              <Route path="/contact/" element={<Contact />} />
            </Routes>
          </MainWrapper>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;