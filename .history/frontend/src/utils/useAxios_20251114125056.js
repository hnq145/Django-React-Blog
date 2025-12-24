import { useContext } from 'react';
// Import Context (default export) từ file AuthContext
// SỬA LỖI: Bỏ phần mở rộng .jsx để trình biên dịch (Vite) tự phân giải
import AuthContext from './AuthContext';

export const useAuth = () => {
    return useContext(AuthContext);
};