import React, { useState, useCallback } from 'react';
import useAxios from './useAxios'; 

export const useAIService = () => {
    const api = useAxios(); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateContent = useCallback(async (prompt, type, context) => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                prompt: prompt,
                type: type,
                context: context
            };
            
            const response = await api.post('/content/generate/', payload);
            
            // Trả về dữ liệu thành công
            // (response.data sẽ là {'type': 'text/image', 'content': '...'})
            return response.data; 

        } catch (err) {
            console.error("Lỗi khi gọi useAIService:", err);
            let errorMessage = "Lỗi không xác định từ AI service.";
            
            // Bóc tách lỗi từ Axios (NFR-02)
            if (err.response) {
                // Lỗi trả về từ server (ví dụ: 503, 400)
                errorMessage = err.response.data?.error || `Lỗi ${err.response.status}`;
            } else if (err.request) {
                // Lỗi mạng, không kết nối được
                errorMessage = "Không thể kết nối đến máy chủ AI.";
            } else {
                errorMessage = err.message;
            }
            setError(errorMessage);
            throw new Error(errorMessage); // Ném lỗi để component cha (Chatbox) có thể bắt

        } finally {
            setIsLoading(false);
        }
    }, [api]); // Phụ thuộc vào instance 'api' từ 'useAxios'

    // 3. Trả về các hàm và trạng thái
    return { isLoading, error, generateContent };
};