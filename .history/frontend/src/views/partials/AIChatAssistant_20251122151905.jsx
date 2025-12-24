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

    return (
        // Khung tổng: Thêm box-sizing border-box để tính toán kích thước chuẩn
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%', 
            height: '100%', 
            minHeight: '400px', 
            maxHeight: '80vh', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
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
                            // Căn trái phải tùy người chat
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div 
                            style={{
                                // CHIẾN THUẬT TRỊ "SỚ TÁO QUÂN":
                                width: 'auto',          // 1. Để tự nhiên
                                minWidth: '40%',        // 2. ÉP BÉO: Luôn rộng ít nhất 40% (trị bệnh ốm nhom)
                                maxWidth: '85%',        // 3. Giới hạn tối đa
                                
                                padding: '12px 16px',
                                borderRadius: '18px',
                                // Bo góc
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '18px',
                                
                                // Màu sắc
                                backgroundColor: msg.role === 'user' ? '#2563EB' : '#F3F4F6', 
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                
                                // Font chữ
                                fontSize: '15px',
                                lineHeight: '1.5',
                                
                                // Xử lý văn bản
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-word',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {msg.type === 'image' ? (
                                <img 
                                    src={msg.content} 
                                    alt="AI" 
                                    style={{ borderRadius: '8px', maxWidth: '100%', height: 'auto', display: 'block' }} 
                                />
                            ) : msg.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '8px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', color: '#6B7280', fontSize: '14px', fontStyle: 'italic' }}>
                            AI đang viết...
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
                        borderRadius: '9999px', 
                        padding: '6px 6px 6px 16px', 
                        boxSizing: 'border-box',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter question..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            width: '100%',
                            
                            border: '0px solid transparent !important', 
                            outline: 'none !important',
                            boxShadow: 'none !important',
                            background: 'transparent',
                            
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