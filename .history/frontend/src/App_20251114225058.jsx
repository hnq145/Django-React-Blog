import React from 'react'; // Bỏ useEffect
import { Route, Routes, BrowserRouter } from "react-router-dom";
// import { setUser } from "./utils/auth"; // Xóa dòng này

// SỬA LỖI: Xóa phần mở rộng .jsx khỏi TẤT CẢ các import
// để Vite tự động phân giải file.
import Index from "./views/core/Index";
import Detail from "./views/core/Detail";
import Search from "./views/core/Search";
import Category from "./views/core/Category";
import About from "./views/pages/About";
import Contact from "./views/pages/Contact";
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
import MainWrapper from "./layouts/MainWrapper"; // Sửa đường dẫn import (Turn 41)

// (Chúng ta KHÔNG dùng AuthProvider nếu bạn dùng MainWrapper)

function App() {

 return (
 	<>
  	<BrowserRouter>
   	<MainWrapper> {/* MainWrapper sẽ xử lý loading và auth */}
    	<Routes>
     	<Route path="/" element={<Index />} />
            {/* ĐÂY LÀ ROUTE ĐÚNG (Turn 41): Đường dẫn phải là /post/:slug/ */}
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