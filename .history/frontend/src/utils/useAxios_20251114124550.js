import { useAuth } from '../context/AuthContext'; 

const useAxios = () => {
    const { api } = useAuth(); 
   
    return api;
};

export default useAxios;