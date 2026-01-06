import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import WebSocketContext from "./WebSocketContext";

export const WebSocketProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await import("../utils/axios").then((module) =>
          module.default.get("author/dashboard/noti-list/")
        );
        setUnreadCount(res.data.length);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadCount();

    const token = Cookies.get("access_token");
    if (!token) {
      return;
    }

    const notificationSocket = new WebSocket(
      `ws://localhost:8000/ws/notifications/?token=${token}`
    );

    notificationSocket.onopen = () => {
      console.log("Notification WebSocket connected");
    };

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Notification received:", data);

      if (data.type === "notification") {
        setNotification(data.message);
        setUnreadCount((prev) => prev + 1);
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
    unreadCount,
    setUnreadCount,
  };

  return (
    <WebSocketContext.Provider value={wsValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
