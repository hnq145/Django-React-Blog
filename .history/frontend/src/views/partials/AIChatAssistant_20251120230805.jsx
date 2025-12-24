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

    const getMessageStyle = (role) => {
        if (role === 'user') return 'bg-blue-600 text-white rounded-br-none';
        if (role === 'ai') return 'bg-gray-100 text-gray-800 rounded-bl-none';
        return 'bg-red-100 text-red-700';
    };

    return (
        // Kích thước tổng thể
        <div className="flex flex-col w-full h-full min-h-[400px] max-h-[80vh] border rounded-lg shadow-xl bg-white overflow-hidden font-sans">
            
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2 shrink-0">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-gray-700 text-sm">AI Assistant</h3>
            </div>

            {/* Nội dung chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scroll-smooth">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words whitespace-pre-wrap ${getMessageStyle(msg.role)}`}>
                            {msg.type === 'image' ? (
                                <img src={msg.content} alt="AI Content" className="rounded-lg max-w-full h-auto block" />
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl rounded-bl-none text-xs italic flex items-center gap-1">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce delay-100">●</span>
                            <span className="animate-bounce delay-200">●</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* PHẦN SỬA QUAN TRỌNG NHẤT: KHUNG NHẬP LIỆU */}
            <div className="p-3 bg-white border-t shrink-0">
                <form 
                    onSubmit={handleSubmit} 
                    // flex-nowrap: CẤM xuống dòng
                    // border rounded-full: Tạo khung bao quanh cả input và button
                    className="flex items-center w-full border border-gray-300 rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white shadow-sm flex-nowrap"
                >
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        // border-none: Bỏ viền input để không bị trùng viền ngoài
                        // w-full min-w-0: Co giãn tối đa trong không gian cho phép
                        className="flex-1 w-full min-w-0 px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0"
                        disabled={isLoading}
                    />
                    
                    {/* Nút gửi */}
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        // shrink-0: Không bao giờ được phép co lại, luôn giữ kích thước thật
                        className={`shrink-0 ml-1 p-2 rounded-full transition-colors flex items-center justify-center ${
                            isLoading || !prompt.trim() 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-blue-600 hover:bg-blue-50 active:bg-blue-100'
                        }`}
                    >
                        {/* Icon gửi */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform rotate-[-45deg] translate-x-[-2px] translate-y-[2px]">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatAssistant;