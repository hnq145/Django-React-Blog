import { useContext } from 'react';
// SỬA LỖI: Import hook 'useAuth' (Named Import) thay vì 'AuthContext' (Default Import)
// Bỏ phần mở rộng .jsx để trình biên dịch (Vite) tự phân giải
import { useAuth } from '../context/AuthContext'; 

const useAxios = () => {
    // 1. Gọi hook useAuth
    const { api } = useAuth(); 
    
    // 2. Trả về instance của axios
    return api;
};

export default useAxios;