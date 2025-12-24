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

            setMessages((prev) => [...prev, { role: 'ai', type: aiResult.type, content: content }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'ai', type: 'error', content: err.message }]);
        }
    };

    const getMessageStyle = (role) => {
        if (role === 'user') return 'bg-blue-600 text-white rounded-br-none';
        if (role === 'ai') return 'bg-gray-100 text-gray-800 rounded-bl-none';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="flex flex-col w-full h-full min-h-[400px] max-h-[80vh] bg-white shadow-xl rounded-lg overflow-hidden font-sans box-border">
            
            {/* HEADER */}
            <div className="p-3 border-b bg-gray-50 flex items-center gap-2 shrink-0">
                <span>🤖</span>
                <h3 className="font-bold text-gray-700 text-sm">AI Assistant</h3>
            </div>

            {/* CHAT BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm break-words whitespace-pre-wrap shadow-sm ${getMessageStyle(msg.role)}`}>
                            {msg.type === 'image' ? (
                                <img src={msg.content} alt="AI" className="rounded-lg max-w-full h-auto" />
                            ) : msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-gray-400 italic px-4">AI đang trả lời...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* FOOTER INPUT - PHẦN FIX CỨNG */}
            <div className="p-2 border-t bg-gray-50 shrink-0 w-full box-border">
                <form 
                    onSubmit={handleSubmit} 
                    // Dùng style trực tiếp để ép Layout Flex không bao giờ xuống dòng
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        width: '100%', 
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        boxSizing: 'border-box' // Quan trọng
                    }}
                >
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        disabled={isLoading}
                        // Style trực tiếp cho Input: Xóa border, xóa outline, ép width
                        style={{
                            flex: 1, // Chiếm hết khoảng trống
                            width: '0px', // Trick để flex hoạt động đúng trong container hẹp
                            minWidth: '0px',
                            border: 'none !important', // Dấu !important để đè CSS global
                            outline: 'none !important',
                            background: 'transparent',
                            padding: '8px',
                            fontSize: '14px',
                            color: '#333',
                            margin: 0,
                            display: 'block' // Tránh inline-block gây lỗi khoảng trắng
                        }}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        // Style trực tiếp cho Button: Kích thước cố định
                        style={{
                            flexShrink: 0, // Cấm co lại
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: prompt.trim() ? '#2563EB' : '#E5E7EB', // Xanh hoặc Xám
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                            marginLeft: '5px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 15L22 2Z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatAssistant;