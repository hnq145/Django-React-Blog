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
        <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white w-full max-w-2xl mx-auto min-h-[400px] max-h-[80vh]">
            {/* Header */}
            <div className="p-2 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-sm text-gray-800">AI Assistant 🤖</h3>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100">
                
                 {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`p-3 rounded-xl max-w-[80%] md:max-w-lg shadow ${getMessageStyle(msg.role)}`}
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
                
                <div ref={messagesEndRef} />
            </div>

           <form onSubmit={handleSubmit} className="p-2 border-t bg-gray-50 rounded-b-lg w-full">
    <div className="flex items-center gap-2 w-full">
        <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI..."
            className="flex-1 w-0 min-w-0 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
        />
        <button
            type="submit"
            // 3. Thêm 'shrink-0': Đảm bảo nút gửi không bao giờ bị co lại
            className={`shrink-0 p-2 rounded-lg text-white transition-colors duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={isLoading}
        >
            {/* Send Icon */}
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