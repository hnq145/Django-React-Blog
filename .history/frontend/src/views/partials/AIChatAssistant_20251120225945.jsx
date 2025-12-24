import React, { useState, useRef, useEffect } from 'react';
import { useAIService } from '../../utils/useAIService'; // Giữ nguyên đường dẫn của bạn

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
        if (!prompt.trim() || isLoading) return;

        const userMessage = { role: 'user', type: 'text', content: prompt };
        setMessages((prev) => [...prev, userMessage]);
        setPrompt('');

        try {
            const type = prompt.toLowerCase().includes('tạo ảnh') ||
                         prompt.toLowerCase().includes('tạo hình') ||
                         prompt.toLowerCase().includes('vẽ')
                         ? 'image' : 'text';

            const aiResult = await generateContent(prompt, type, contextString);

            // Chuẩn hóa dữ liệu trả về để tránh lỗi
            const content = aiResult.type === 'image' 
                ? `data:image/jpeg;base64,${aiResult.content}` 
                : aiResult.content;

            setMessages((prev) => [
                ...prev,
                { role: 'ai', type: aiResult.type, content: content }
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', type: 'error', content: err.message || 'Có lỗi xảy ra' }
            ]);
        }
    };

    // Style cơ bản, dễ nhìn, phân biệt rõ người và AI
    const getMessageStyle = (role) => {
        if (role === 'user') return 'bg-blue-600 text-white rounded-br-none'; // Bo góc kiểu chat
        if (role === 'ai') return 'bg-gray-200 text-gray-800 rounded-bl-none';
        return 'bg-red-100 text-red-700';
    };

    return (
        // CONTAINER CHÍNH: 
        // w-full: Chiếm hết chiều rộng cho phép
        // overflow-hidden: Cắt bỏ mọi thứ thừa thãi thò ra ngoài (QUAN TRỌNG)
        <div className="flex flex-col w-full h-full min-h-[400px] max-h-[80vh] border rounded-lg shadow-xl bg-white overflow-hidden">
            
            {/* 1. HEADER */}
            <div className="p-3 border-b bg-gray-50 flex items-center gap-2 shrink-0">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-gray-700">AI Assistant</h3>
            </div>

            {/* 2. MESSAGE LIST (Phần nội dung chat) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        // Flex logic để căn trái/phải
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            // MESSAGE BUBBLE:
                            // max-w-[80%]: Không bao giờ chiếm hết màn hình
                            // break-words: Tự xuống dòng nếu chữ quá dài
                            // p-3 rounded-xl: Tạo hình dáng chữ nhật bo tròn
                            className={`max-w-[80%] p-3 rounded-xl shadow-sm break-words ${getMessageStyle(msg.role)}`}
                        >
                            {msg.type === 'image' ? (
                                <img
                                    src={msg.content}
                                    alt="AI Content"
                                    className="rounded-lg max-w-full h-auto block"
                                />
                            ) : (
                                // whitespace-pre-wrap: Giữ định dạng xuống dòng của AI nhưng vẫn gói gọn trong khung
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl rounded-bl-none text-sm italic animate-pulse">
                            AI đang trả lời...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 3. FOOTER INPUT (Phần nhập liệu) */}
            {/* w-full: Đảm bảo form rộng bằng container */}
            <form 
                onSubmit={handleSubmit} 
                className="p-3 border-t bg-gray-50 w-full shrink-0"
            >
                <div className="flex flex-row items-center gap-2 w-full">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        // flex-1: Chiếm hết khoảng trống còn lại
                        // min-w-0: CHÌA KHÓA để input không bị tràn ra ngoài flex container
                        className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        // shrink-0: Đảm bảo nút không bị co lại khi màn hình nhỏ
                        className={`shrink-0 p-2 rounded-full text-white transition-colors ${
                            isLoading || !prompt.trim() 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }`}
                    >
                        {/* Icon Send đơn giản */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatAssistant;