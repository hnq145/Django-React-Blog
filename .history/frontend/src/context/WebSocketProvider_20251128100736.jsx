
import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        
        const notificationSocket = new WebSocket('ws://localhost:8000/ws/notifications/');

        notificationSocket.onopen = () => {
            console.log('Notification WebSocket connected');
        };

        notificationSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Notification received:', data);

            
            if (data.type === 'notification') {
                setNotification(data.message);
            }
        };

        notificationSocket.onclose = () => {
            console.log('Notification WebSocket disconnected');
        };

        notificationSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Clean up the connection when the component unmounts
        return () => {
            notificationSocket.close();
        };
    }, []); // Empty dependency array ensures this runs only once

    // The value provided to the context consumers
    const wsValue = {
        notification,
        // In the future, we can add a function here to send messages if needed
    };

    return (
        <WebSocketContext.Provider value={wsValue}>
            {children}
        </WebSocketContext.Provider>
    );
};
