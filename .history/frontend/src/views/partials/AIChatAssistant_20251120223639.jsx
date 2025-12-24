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
        
        <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white w-full max-w-2xl mx-auto min-h-[400px] max-h-[80vh] overflow-hidden box-border">
            
            {/* Header */}
            <div className="p-2 border-b bg-gray-50 rounded-t-lg shrink-0">
                <h3 className="font-semibold text-sm text-gray-800">AI Assistant 🤖</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100 scroll-smooth">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`p-3 rounded-xl max-w-[85%] shadow break-words ${getMessageStyle(msg.role)}`}
                        >
                            {msg.type === 'image' ? (
                                <img
                                    src={msg.content}
                                    alt="AI generated"
                                    className="rounded-lg max-w-full h-auto"
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-gray-200 text-gray-800 shadow">
                            <span className="animate-pulse text-sm">AI is analyzing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50 rounded-b-lg shrink-0">

                <div className="flex items-center bg-white border border-gray-300 rounded-xl px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask the AI..."
                        // border-none & focus:ring-0: Xóa viền riêng của input để nó hòa nhập vào khối chung
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