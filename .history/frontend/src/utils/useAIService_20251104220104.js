import { useState, useCallback } from 'react';
import { useAxios } from './useAxios'; 

export const useAIService = () => {
    const { apiCall } = useAxios(); 
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * The function calls the Backend API to get the AI ​​summary.
     * @param {number} postId - ID của bài viết cần tóm tắt.
    */
    const getSummary = useCallback(async (postId) => {
        // 1. Kiểm tra nếu đã có tóm tắt, tránh gọi lại
        if (summary) return summary;

        setIsLoading(true);
        setError(null);

        try {
            // Endpoint: POST /posts/{post_id}/summarize/
            const url = `/posts/${postId}/summarize/`;
            
            // FR-AI-01: Vì API này cho mọi người dùng, isAuthenticated = false
            const response = await apiCall({ 
                url: url, 
                method: 'POST',
                isAuthenticated: false,
            });
            
            // response.summary là dữ liệu trả về từ Backend Django
            setSummary(response.summary);
            return response.summary;

        } catch (err) {
            console.error("Lỗi khi gọi API Tóm tắt:", err.message);
            // NFR-AI-02: Hiển thị lỗi thân thiện cho người dùng
            setError(err.message || "Đã xảy ra lỗi hệ thống khi lấy tóm tắt AI. Vui lòng thử lại.");
            setSummary(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [apiCall, summary]); // Thêm summary vào dependency để hook có thể kiểm tra trạng thái cache

    return { summary, isLoading, error, getSummary };
};
