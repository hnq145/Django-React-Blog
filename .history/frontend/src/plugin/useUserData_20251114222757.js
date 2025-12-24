import Cookies from "js-cookie";
// SỬA LỖI 1 (Syntax): Thay đổi import từ 'default' sang 'named'
import { jwtDecode } from "jwt-decode";

// Lưu ý: Tên file là 'useUserData' nhưng đây là một HÀM, không phải Hook
// (Vì nó không dùng 'useState' hay 'useContext')
// Đây là lý do file 'constants.js' có thể gọi nó
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