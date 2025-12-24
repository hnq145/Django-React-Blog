import React, { useState } from 'react';
import useAxios from './useAxios'; 

export const useAIService = () => {
    
    const api = useAxios(); 
    
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * 
     * @param {number} postId 
     */
    const getSummary = async (postId) => {
        if (!postId) {
            setError("Error: Post ID not found.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const url = `/posts/${postId}/summarize/`; 
        
        try {
            const response = await api.post(url);

            if (response.data && response.data.summary) {
                setSummary(response.data.summary);
            } else {
                setError("The AI ​​service was unable to generate a summary for this article.");
            }
        } catch (err) {
            console.error("AI API call error:", err);

            let errorMessage = "A system error occurred while requesting AI.";
            if (err.response?.status === 503) {
                 errorMessage = "AI service is temporarily unavailable (Error 503). Please try again later.";
            } else if (err.response?.status === 400) {
                errorMessage = "Dữ liệu bài viết không hợp lệ.";
            }
            setError(errorMessage);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    };

    const resetSummary = () => {
        setSummary(null);
        setError(null);
        setIsLoading(false);
    }

    return { summary, isLoading, error, getSummary, resetSummary };
};
