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
        <div className="flex flex-col w-full h-full min-h-[400px] max-h-[80vh] bg-white shadow-xl rounded-lg overflow-hidden font-sans box-border">
            
            {/* HEADER */}
            <div className="p-3 border-b bg-gray-50 flex items-center gap-2 shrink-0">
                <span>🤖</span>
                <h3 className="font-bold text-gray-700 text-sm">AI Assistant</h3>
            </div>

            {/* CHAT BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        // Flex row để căn chỉnh trái/phải
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '10px'
                        }}
                    >
                        {/* BONG BÓNG CHAT */}
                        <div 
                            style={{
                                // QUAN TRỌNG: fit-content giúp bong bóng ôm sát nội dung
                                width: 'fit-content', 
                                maxWidth: '80%', // Không bao giờ rộng quá 80% khung
                                padding: '10px 14px',
                                borderRadius: '16px',
                                // Bo góc tùy theo người nói cho đẹp
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                                backgroundColor: msg.role === 'user' ? '#2563EB' : '#F3F4F6', // Xanh hoặc Xám
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                wordBreak: 'break-word', // Tự xuống dòng nếu từ quá dài
                                whiteSpace: 'pre-line', // Giữ xuống dòng nhưng gộp khoảng trắng thừa
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
                     <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '10px' }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontStyle: 'italic', color: '#6B7280' }}>
                            AI đang viết...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* FOOTER INPUT - GIỮ NGUYÊN PHẦN ĐÃ FIX ĐẸP */}
            <div className="p-2 border-t bg-gray-50 shrink-0 w-full box-border">
                <form 
                    onSubmit={handleSubmit} 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        width: '100%', 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '24px',
                        padding: '4px 6px 4px 12px', // Padding tinh chỉnh
                        boxSizing: 'border-box',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
                            width: '0px',
                            minWidth: '0px',
                            border: 'none !important',
                            outline: 'none !important',
                            background: 'transparent',
                            padding: '6px 0',
                            fontSize: '14px',
                            color: '#333',
                            margin: 0,
                            display: 'block'
                        }}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        style={{
                            flexShrink: 0,
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: prompt.trim() && !isLoading ? '#2563EB' : '#F3F4F6',
                            color: prompt.trim() && !isLoading ? 'white' : '#9CA3AF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: prompt.trim() && !isLoading ? 'pointer' : 'not-allowed',
                            marginLeft: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 15L22 2Z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatAssistant;