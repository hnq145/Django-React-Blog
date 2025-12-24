import { useAuth } from '../context/AuthContext'; 

const useAxios = () => {
    const { api } = useAuth(); 
    
    // 2. Trả về instance của axios
    return api;
};

export default useAxios;