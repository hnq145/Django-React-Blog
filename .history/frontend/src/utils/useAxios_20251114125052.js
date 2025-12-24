import { useContext } from 'react';
// Import Context (default export) từ file AuthContext
// SỬA LỖI: Bỏ phần mở rộng .jsx để trình biên dịch (Vite) tự phân giải
import AuthContext from './AuthContext';

/**
 * Custom Hook: useAuth
 * * Mục đích: 
 * 1. Tách biệt Hook ra khỏi Component để tuân thủ React Fast Refresh.
 * 2. Cung cấp Context (user, api, loginUser, logoutUser) cho 
 * bất kỳ component nào gọi nó.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};