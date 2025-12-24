import React, { useState, useRef, useEffect } from 'react';
import { useAIService } from '../../utils/useAIService'; 

const AIChatAssistant = ({ contextString }) => {
    const { isLoading, generateContent } = useAIService();

    const [prompt, setPrompt] = useState(''); 
    const [messages, setMessages] = useState([]); 
    
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return; // Không gửi nếu đang tải hoặc input rỗng

        const userMessage = { role: 'user', type: 'text', content: prompt };
        
        // Cập nhật giao diện ngay lập tức với tin nhắn của người dùng
        setMessages((prev) => [...prev, userMessage]);
        setPrompt(''); // Xóa ô input

        try {
            // Xác định loại yêu cầu (Text hay Image)
            const type = prompt.toLowerCase().includes('tạo ảnh') || 
                         prompt.toLowerCase().includes('tạo hình') ||
                         prompt.toLowerCase().includes('vẽ') 
                         ? 'image' : 'text';

            // GỌI API (Sử dụng Hook)
            // Truyền 3 tham số quan trọng: prompt, type, và contextString (bối cảnh)
            const aiResult = await generateContent(prompt, type, contextString);

            // Xử lý kết quả trả về từ Backend
            if (aiResult.type === 'image') {
                setMessages((prev) => [
                    ...prev,
                    { 
                        role: 'ai', 
                        type: 'image', 
                        // Hiển thị hình ảnh Base64
                        content: `data:image/jpeg;base64,${aiResult.content}` 
                    }
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { 
                        role: 'ai', 
                        type: 'text', 
                        content: aiResult.content 
                    }
                ]);
            }
        
        } catch (err) {
            // Bắt lỗi được ném ra từ useAIService
            setMessages((prev) => [
                ...prev,
                { role: 'ai', type: 'error', content: err.message }
            ]);
        }
    };

    // Style cho các bong bóng chat
    const getMessageStyle = (role) => {
        if (role === 'user') return 'bg-blue-600 text-white self-end';
        if (role === 'ai') return 'bg-gray-200 text-gray-800 self-start';
        return 'bg-red-100 text-red-700 self-start'; // Lỗi
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg shadow-lg bg-white">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-lg text-gray-800">Trợ lý AI Ngữ cảnh 🤖</h3>
                <p className="text-sm text-gray-500">
                    AI đã đọc bối cảnh. Hãy ra yêu cầu!
                </p>
            </div>

            {/* Khung Tin nhắn */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 text-sm p-4">
                        Nhập yêu cầu (ví dụ: "Tóm tắt nội dung", "Bắt lỗi chính tả", hoặc "Tạo ảnh đại diện một lập trình viên đang code").
                    </p>
                )}
                
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div 
                            className={`p-3 rounded-xl max-w-xs md:max-w-md shadow ${getMessageStyle(msg.role)}`}
                        >
                            {msg.type === 'image' ? (
                                <img 
                                    src={msg.content} 
                                    alt="AI generated" 
                                    className="rounded-lg" 
                                />
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Trạng thái Loading */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-gray-200 text-gray-800 shadow">
                            <span className="animate-pulse">AI đang phân tích...</span>
                        </div>
                    </div>
                )}
                
                {/* Ref để tự động cuộn */}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Yêu cầu AI (ví dụ: Tạo ảnh...)"
                        className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`p-2 rounded-lg text-white transition duration-300 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={isLoading}
                    >
                        {/* Icon Gửi */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 15L22 2Z"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatAssistant;