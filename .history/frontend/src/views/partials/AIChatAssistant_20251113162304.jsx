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
        <div className="flex flex-col h-screen border rounded-lg shadow-lg bg-white" style={{ maxHeight: '500px' }}>
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-lg text-gray-800">Contextual AI Assistant 🤖</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100">
                
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

                {/* Loading Status */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-gray-200 text-gray-800 shadow">
                            <span className="animate-pulse">AI is analyzing...</span>
                        </div>
                    </div>
                )}
                
                {/* Ref to auto scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex space-x-2">
                    {/* Nút Tạo Ảnh (Hành động nhanh) */}
                    <button
                        type="button"
                        onClick={handleImageRequest}
                        className={`p-2 rounded-lg text-white transition duration-300 ${isLoading ? 'bg-indigo-300' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                        title="Tạo ảnh đại diện"
                        disabled={isLoading}
                    >
                        {/* Icon Hình ảnh (Dùng SVG thay vì lucide-react để tránh dependency) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                    </button>
                    
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Yêu cầu tùy chỉnh..."
                        className="flex-grow p-2 border border-gray-300 rounded-lg"
                        disabled={isLoading}
                    />
                    
                    <button
                        type="submit"
                        className={`p-2 rounded-lg text-white transition duration-300 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={isLoading}
                    >
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