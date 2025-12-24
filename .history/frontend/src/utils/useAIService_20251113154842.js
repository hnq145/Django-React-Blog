import React, { useState, useCallback } from 'react';
import useAxios from './useAxios'; 

/**
 * Custom Hook (useAIService)
 * * Mục đích: 
 * 1. Cung cấp hàm `generateContent` để gọi API Backend AI (/api/v1/content/generate/).
 * 2. Quản lý trạng thái loading, error cho các component AI.
 * * Sử dụng 'useAxios' (hook cơ sở của bạn) để thực hiện các lệnh gọi API đã được 
 * xác thực (đính kèm JWT Token) và cấu hình (Base URL).
 */
export const useAIService = () => {
    // 1. Lấy instance của axios (đã cấu hình) từ hook cơ sở của bạn
    // (Giả định hook 'useAxios' của bạn trả về một instance axios)
    // Nếu 'useAxios' của bạn trả về { apiCall }, hãy thay 'api' bằng 'apiCall'
    const api = useAxios(); 
    
    // 2. Quản lý trạng thái cho các component sử dụng hook này
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Hàm gọi API Backend Django để tạo nội dung AI
     * (Tuân thủ PATT 2.1)
     */
    const generateContent = useCallback(async (prompt, type, context) => {
        setIsLoading(true);
        setError(null);

        try {
            // Chuẩn bị payload theo yêu cầu PATT 2.1
            const payload = {
                prompt: prompt,
                type: type,
                context: context
            };

            // Gọi API Backend (endpoint đã định nghĩa trong api/urls.py)
            // (Giả định instance 'api' của bạn có phương thức .post)
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