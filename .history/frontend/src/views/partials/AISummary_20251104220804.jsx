import React from 'react';
import { useAIService } from '../utils/useAIService'; 

/**
 * Component AISummary
 * Hiển thị nút bấm, trạng thái tải, và kết quả tóm tắt AI.
 *
 * @param {number} postId - ID của bài viết (từ PostDetail).
 * @param {string} postTitle - Tiêu đề bài viết (Chỉ để hiển thị).
 */
function AISummary({ postId, postTitle }) {
    // Sử dụng custom hook chuyên biệt cho AI
    const { summary, isLoading, error, getSummary } = useAIService();

    return (
        <div className="ai-summary-container my-6 p-5 border-l-4 border-blue-500 rounded-lg shadow-lg bg-white">
            <h4 className="text-xl font-bold mb-3 text-blue-700 flex items-center">
                <span className="mr-2">✨</span> Trợ lý Tóm tắt AI
            </h4>

            {/* Điều kiện: Chỉ hiển thị nút nếu chưa có tóm tắt */}
            {!summary && !isLoading && (
                <button
                    onClick={() => getSummary(postId)}
                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 shadow-md"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang phân tích...' : 'Tóm tắt nhanh bài viết này ⚡'}
                </button>
            )}

            {/* Hiển thị trạng thái Loading (NFR-AI-02) */}
            {isLoading && (
                <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-5 h-5 border-t-2 border-green-600 rounded-full animate-spin"></div>
                    <span>AI đang phân tích bài viết "{postTitle}"...</span>
                </div>
            )}

            {/* Hiển thị thông báo lỗi (NFR-AI-02) */}
            {error && (
                <div className="text-red-700 bg-red-50 p-3 rounded-md border border-red-300 mt-3">
                    <p><strong>Lỗi Tóm tắt:</strong> {error}</p>
                    <p className="text-sm mt-1">Vui lòng thử lại sau hoặc kiểm tra API Key Backend.</p>
                </div>
            )}

            {/* Hiển thị kết quả tóm tắt (FR-AI-01) */}
            {summary && (
                <div className="mt-4">
                    <h5 className="font-semibold text-lg border-b pb-1 mb-2 text-gray-800">Bản Tóm Tắt (3-5 câu):</h5>
                    <p className="text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AISummary;
