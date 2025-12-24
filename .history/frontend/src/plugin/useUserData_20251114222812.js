import Cookies from "js-cookie";

import { jwtDecode } from "jwt-decode";

function useUserData() {
 let access_token = Cookies.get("access_token");
 let refresh_token = Cookies.get("refresh_token");

 if (access_token && refresh_token) {
    // SỬA LỖI 2 (Logic): Bạn phải giải mã 'access_token',
    // vì 'refresh_token' không chứa thông tin user
  const token = access_token; 
  const decoded = jwtDecode(token); // Gọi hàm đã import đúng

  return decoded;
 } else {
  return null;
 }
}

export default useUserData;