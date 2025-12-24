import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function useUserData() {
  let access_token = Cookies.get("access_token");
  let refresh_token = Cookies.get("refresh_token");

  if (access_token && refresh_token) {
    const token = access_token; 
    const decoded = jwtDecode(token);
    
    return {
      user_id: decoded.user_id,  // ✅ Extract user_id
      username: decoded.username,
      email: decoded.email,
      // ...other fields
    };
  } else {
    return null;
  }
}

export default useUserData;