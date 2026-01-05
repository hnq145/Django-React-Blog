import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import WebSocketContext from "./WebSocketContext";

export const WebSocketProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      return;
    }

    const notificationSocket = new WebSocket(
      `ws://localhost:8001/ws/notifications/?token=${token}`
    );

    notificationSocket.onopen = () => {
      console.log("Notification WebSocket connected");
    };

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Notification received:", data);

      if (data.type === "notification") {
        setNotification(data.message);
      }
    };

    notificationSocket.onclose = () => {
      console.log("Notification WebSocket disconnected");
    };

    notificationSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      notificationSocket.close();
    };
  }, []);

  const wsValue = {
    notification,
  };

  return (
    <WebSocketContext.Provider value={wsValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
