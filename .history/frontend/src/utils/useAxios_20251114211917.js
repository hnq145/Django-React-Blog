import { useAuth } from '../context/useAuth.js'; 

const useAxios = () => {
    const { api } = useAuth(); 
    return api;
};

export default useAxios;