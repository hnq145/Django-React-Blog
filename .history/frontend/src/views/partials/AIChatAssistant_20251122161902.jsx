import React, { useState, useRef, useEffect } from 'react';
// import { useAIService } from '../../utils/useAIService'; 

// Mock useAIService for runnable example, replace with your actual import
const useAIService = () => {
    // In a real application, this would handle API calls to your Gemini service
    const [isLoading, setIsLoading] = useState(false);
    
    const generateContent = async (prompt, type) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        if (type === 'image') {
            
            return { type: 'image', content: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" };
        }
        
        return { type: 'text', content: `Xin chào! Bạn đã hỏi về: "${prompt}". Đây là câu trả lời mô phỏng từ AI.` };
    };

    return { isLoading, generateContent };
};


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

            // contextString được truyền vào để cung cấp ngữ cảnh cho AI
            const aiResult = await generateContent(prompt, type, contextString); 
            
            // Xử lý nội dung dựa trên loại (text/image). 
            // Giả định generateContent trả về base64 string cho type: 'image'
            const content = aiResult.type === 'image' 
                ? `data:image/png;base64,${aiResult.content}` // Use image/png or image/jpeg as appropriate
                : aiResult.content;

            setMessages((prev) => [...prev, { role: 'ai', type: aiResult.type, content: content }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'ai', type: 'error', content: `Lỗi: ${err.message}` }]);
        }
    };

    // Style cho thanh loading
    const LoadingDots = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div className="dot" style={{ 
                width: '6px', height: '6px', backgroundColor: '#6B7280', borderRadius: '50%', 
                animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0s'
            }}></div>
            <div className="dot" style={{ 
                width: '6px', height: '6px', backgroundColor: '#6B7280', borderRadius: '50%', 
                animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0.2s'
            }}></div>
            <div className="dot" style={{ 
                width: '6px', height: '6px', backgroundColor: '#6B7280', borderRadius: '50%', 
                animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0.4s'
            }}></div>
            <style>
                {`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                `}
            </style>
        </div>
    );

    return (
        // ĐÃ CHỈNH SỬA: margin được đổi thành '20px auto 20px 0' để căn lề trái.
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%', 
            maxWidth: '450px', // Đặt lại kích thước chiều rộng cố định (dạng cột)
            
            // THAY ĐỔI QUAN TRỌNG NHẤT: Bỏ auto margin bên trái, giữ auto margin bên phải
            // Cú pháp: margin: [top] [right] [bottom] [left]
            // margin: '20px auto 20px 0' => 0 margin trái, auto margin phải -> Đẩy khung về trái.
            margin: '20px auto 20px -100px', 
            
            height: '100%', 
            minHeight: '500px', 
            maxHeight: '60vh', // Đặt lại chiều cao về mức ban đầu (hoặc gần đó)
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            
            {/* HEADER */}
            <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>AI Assistant</h3>
            </div>

            {/* CHAT BODY */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div 
                            style={{
                                width: 'auto',     
                                minWidth: '30%',    
                                maxWidth: '85%', // Tăng max width cho message
                                
                                padding: '12px 16px',
                                borderRadius: '18px',
                                
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '18px',
                                
                                backgroundColor: msg.role === 'user' ? '#2563EB' : '#F3F4F6', 
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                
                                fontSize: '15px',
                                lineHeight: '1.5',
                                
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-word',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {msg.type === 'image' ? (
                                <img 
                                    src={msg.content} 
                                    alt="AI Generated Image" 
                                    style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto', display: 'block' }} 
                                    // Placeholder fallbacks
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevents infinite loop
                                        e.target.src = "https://placehold.co/200x200/cccccc/333333?text=Image+Load+Error";
                                    }}
                                />
                            ) : msg.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '10px 16px', borderRadius: '18px', borderBottomLeftRadius: '4px', color: '#6B7280', fontSize: '15px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LoadingDots />
                            AI đang trả lời...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* FOOTER INPUT */}
            <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb', flexShrink: 0 }}>
                <form 
                    onSubmit={handleSubmit} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        width: '100%', 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '500px', 
                        padding: '6px 6px 6px 16px', 
                        boxSizing: 'border-box',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            width: '100%',
                            height: '40px', // Đã giảm chiều cao input cho chuẩn hơn
                            border: '5px solid transparent !important', 
                            outline: 'none !important',
                            boxShadow: 'none !important',
                            background: 'transparent',
                            borderRadius: '500px',
                            fontSize: '15px',
                            color: '#111827',
                            margin: 0,
                            padding: 0
                        }}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        style={{
                            flexShrink: 0,
                            width: '36px',
                            height: '36px',
                            marginLeft: '8px',
                            border: 'none',
                            borderRadius: '50%',
                            
                            background: prompt.trim() && !isLoading ? '#2563EB' : '#E5E7EB',
                            color: prompt.trim() && !isLoading ? 'white' : '#9CA3AF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 15L22 2Z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatAssistant;