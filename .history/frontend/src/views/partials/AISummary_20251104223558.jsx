import React from 'react';
import { useAIService } from '../../utils/useAIService'; 

/**
 * 
 * 
 *
 * @param {number} postId 
 * @param {string} postTitle 
 */

function AISummary({ postId, postTitle }) {
    const { summary, isLoading, error, getSummary } = useAIService();

    return (
        <div className="ai-summary-container my-6 p-5 border-l-4 border-blue-500 rounded-lg shadow-lg bg-white">
            <h4 className="text-xl font-bold mb-3 text-blue-700 flex items-center">
                <span className="mr-2">✨</span> AI Assistant
            </h4>

            {!summary && !isLoading && (
                <button
                    onClick={() => getSummary(postId)}
                    className="bg-green-600 text-black font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition duration-300 shadow-md"
                    disabled={isLoading}
                >
                    {isLoading ? 'Analyzing...' : 'Quick summary of this article ✨'}
                </button>
            )}

            {isLoading && (
                <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-5 h-5 border-t-2 border-green-600 rounded-full animate-spin"></div>
                    <span>AI is analyzing the article "{postTitle}"...</span>
                </div>
            )}

            {error && (
                <div className="text-red-700 bg-red-50 p-3 rounded-md border border-red-300 mt-3">
                    <p><strong>Error Summary:</strong> {error}</p>
                    <p className="text-sm mt-1">Please try again later.</p>
                </div>
            )}

            {summary && (
                <div className="mt-4">
                    <h5 className="font-semibold text-lg border-b pb-1 mb-2 text-gray-800">Summary:</h5>
                    <p className="text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AISummary;
