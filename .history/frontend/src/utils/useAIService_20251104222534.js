import React, { useState } from 'react';
import useAxios from './useAxios'; 

export const useAIService = () => {
    
    const api = useAxios(); 
    
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * .
     * @param {number} postId 
     */
    const getSummary = async (postId) => {
        if (!postId) {
            setError("Lỗi: Không tìm thấy ID bài viết.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const url = `/posts/${postId}/summarize/`; 
        
        try {
            // Backend sẽ tự động xử lý logic Caching (kiểm tra CSDL trước).
            const response = await api.post(url);

            if (response.data && response.data.summary) {
                setSummary(response.data.summary);
            } else {
                // Xử lý trường hợp Backend trả về status 200 nhưng không có dữ liệu tóm tắt.
                setError("Dịch vụ AI không thể tạo bản tóm tắt cho bài viết này.");
            }
        } catch (err) {
            console.error("Lỗi gọi API AI:", err);
            // Xử lý lỗi chi tiết hơn từ response
            let errorMessage = "Đã xảy ra lỗi hệ thống khi yêu cầu AI.";
            if (err.response?.status === 503) {
                 errorMessage = "Dịch vụ AI tạm thời không khả dụng (Lỗi 503). Vui lòng thử lại sau.";
            } else if (err.response?.status === 400) {
                errorMessage = "Dữ liệu bài viết không hợp lệ.";
            }
            setError(errorMessage);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm tiện ích để reset trạng thái
    const resetSummary = () => {
        setSummary(null);
        setError(null);
        setIsLoading(false);
    }

    return { summary, isLoading, error, getSummary, resetSummary };
};
