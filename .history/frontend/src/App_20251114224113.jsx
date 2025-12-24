import React from 'react'; // Bỏ useEffect
import { Route, Routes, BrowserRouter } from "react-router-dom";
// import { setUser } from "./utils/auth"; // Xóa dòng này

// SỬA LỖI: Thêm phần mở rộng .jsx vào TẤT CẢ các import
// để giúp Vite/ESBuild tìm file chính xác.
import Index from "./views/core/Index.jsx";
import Detail from "./views/core/Detail.jsx";
import Search from "./views/core/Search.jsx";
import Category from "./views/core/Category.jsx";
import About from "./views/pages/About.jsx";
import Contact from "./views/pages/Contact.jsx";
import Register from "./views/auth/Register.jsx";
import Login from "./views/auth/Login.jsx";
import Logout from "./views/auth/Logout.jsx";
import ForgotPassword from "./views/auth/ForgotPassword.jsx";
import CreatePassword from "./views/auth/CreatePassword.jsx";
import Dashboard from "./views/dashboard/Dashboard.jsx";
import Posts from "./views/dashboard/Posts.jsx";
import AddPost from "./views/dashboard/AddPost.jsx";
import EditPost from "./views/dashboard/EditPost.jsx";
import Comments from "./views/dashboard/Comments.jsx";
import Notifications from "./views/dashboard/Notifications.jsx";
import Profile from "./views/dashboard/Profile.jsx";
import MainWrapper from "./layouts/MainWrapper.jsx"; // Sửa đường dẫn import (Turn 41)

// (Chúng ta KHÔNG dùng AuthProvider nếu bạn dùng MainWrapper)

function App() {

  // XÓA BỎ useEffect(setUser) ở đây VÌ MainWrapper đã làm rồi
  // useEffect(() => {
  //   setUser(); 
  // }, []);

 return (
  <>
   <BrowserRouter>
    <MainWrapper> {/* MainWrapper sẽ xử lý loading và auth */}
     <Routes>
      <Route path="/" element={<Index />} />
            {/* Sửa lỗi Turn 41: Đường dẫn phải là /post/:slug/ */}
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
   </BrowserRouter>
  </>
 );
}

export default App;