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
            
            return response.data; 

        } catch (err) {
            console.error("Error when calling useAIService:", err);
            let errorMessage = "Unknown error from AI service.";
            
            if (err.response) {
                errorMessage = err.response.data?.error || `Error ${err.response.status}`;
            } else if (err.request) {
                errorMessage = "Unable to connect to AI server.";
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