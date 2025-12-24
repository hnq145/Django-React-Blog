// frontend/src/context/useAuth.js
import { useContext } from 'react';
// Sửa lỗi import: Thêm .jsx để Vite/ESBuild nhận diện
import AuthContext from './AuthContext.jsx'; 

export const useAuth = () => {
    return useContext(AuthContext);
};