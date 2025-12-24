import { useAuth } from '../context/useAuth.js'; 

const useAxios = () => {
    const { api } = useAuth(); 
    return api;
};

// SỬA ĐỔI 3: Export default (như file gốc của bạn)
export default useAxios;