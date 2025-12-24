import { useContext } from 'react';
// SỬA LỖI: Import hook 'useAuth' (Named Import) thay vì 'AuthContext' (Default Import)
// Bỏ phần mở rộng .jsx để trình biên dịch (Vite) tự phân giải
import { useAuth } from '../context/AuthContext'; 

/**
 * Custom Hook: useAxios
 * * Mục đích: 
 * 1. Lấy instance của 'api' (axios đã được cấu hình với interceptor) 
 * từ 'AuthContext'.
 * 2. Cung cấp instance 'api' này cho bất kỳ component nào cần gọi API 
 * (ví dụ: 'useAIService' của chúng ta).
 * * Đây là cách làm đúng để chia sẻ một axios instance duy nhất 
 * trong toàn bộ ứng dụng.
 */
const useAxios = () => {
    // 1. Gọi hook useAuth
    const { api } = useAuth(); 
    
    // 2. Trả về instance của axios
    return api;
};

export default useAxios;