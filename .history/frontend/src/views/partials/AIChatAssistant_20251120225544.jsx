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

            if (aiResult.type === 'image') {
                setMessages((prev) => [
                    ...prev,
                    { 
                        role: 'ai', 
                        type: 'image', 
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
            setMessages((prev) => [
                ...prev,
                { role: 'ai', type: 'error', content: err.message }
            ]);
        }
    };

    const getMessageStyle = (role) => {
        if (role === 'user') return 'bg-blue-600 text-white self-end';
        if (role === 'ai') return 'bg-gray-200 text-gray-800 self-start';
        return 'bg-red-100 text-red-700 self-start'; 
    };

    return (
        <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white w-full max-w-2xl mx-auto min-h-[400px] max-h-[80vh] overflow-hidden">
            
            {/* Header */}
            <div className="p-3 border-b bg-gray-50 shrink-0">
                <h3 className="font-semibold text-sm text-gray-800">AI Assistant 🤖</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100 scroll-smooth">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            // LOGIC FIX KHUNG CHAT "SỚ TÁO QUÂN":
                            // 1. max-w-[85%]: Giới hạn chiều rộng tối đa.
                            // 2. w-fit: Co giãn theo nội dung (quan trọng).
                            // 3. shadow-sm: Đổ bóng nhẹ cho đẹp.
                            className={`
                                relative px-4 py-3 rounded-2xl shadow-sm 
                                max-w-[85%] w-fit md:max-w-[75%]
                                ${getMessageStyle(msg.role)}
                            `}
                        >
                            {msg.type === 'image' ? (
                                <img
                                    src={msg.content}
                                    alt="AI generated"
                                    className="rounded-lg max-w-full h-auto"
                                />
                            ) : (
                                // whitespace-pre-line: Giữ xuống dòng nhưng không giữ khoảng trắng thừa ngang
                                <p className="whitespace-pre-line break-words text-sm leading-relaxed min-w-[2rem]">
                                    {msg.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading Status - ĐÃ KHÔI PHỤC LẠI CHỮ CHO BẠN */}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="px-4 py-3 rounded-2xl bg-gray-200 text-gray-600 shadow-sm">
                            <div className="flex items-center gap-2">
                                {/* Icon xoay nhẹ (spinner) */}
                                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-medium animate-pulse">AI is analyzing...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Footer Input - Giữ nguyên phiên bản đẹp nhất */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50 shrink-0">
                <div className="flex items-center bg-white border border-gray-300 rounded-xl px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask the AI..."
                        className="flex-1 w-full min-w-0 py-2 px-2 text-sm bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`shrink-0 p-2 ml-1 rounded-lg transition-all duration-200 ${
                            prompt.trim() && !isLoading 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={isLoading || !prompt.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 15L22 2Z"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatAssistant;