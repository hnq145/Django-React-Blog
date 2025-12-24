// frontend/src/utils/useAxios.js

// SỬA ĐỔI 1: Import 'useAuth' từ file 'useAuth.js' mới
import { useAuth } from '../context/useAuth.js'; 

const useAxios = () => {
    // SỬA ĐỔI 2: Lấy 'api' từ useAuth
    const { api } = useAuth(); 
    return api;
};

// SỬA ĐỔI 3: Export default (như file gốc của bạn)
export default useAxios;