import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import WebSocketContext from "./WebSocketContext";
import Toast from "../plugin/Toast";

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial unread count AND notifications
    const fetchNotifications = async () => {
      const token = Cookies.get("access_token");
      if (!token) return;

      try {
        const res = await import("../utils/axios").then((module) =>
          module.default.get("author/dashboard/noti-list/"),
        );
        setNotifications(res.data);
        // data.length is a reasonable approximation if API returns all or unread
        setUnreadCount(res.data.filter((n) => !n.seen).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const token = Cookies.get("access_token");
    if (!token) {
      return;
    }

    const notificationSocket = new WebSocket(
      `ws://localhost:8000/ws/notifications/?token=${token}`,
    );

    notificationSocket.onopen = () => {
      console.log("Notification WebSocket connected");
    };

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Notification received:", data);

      if (data.type === "notification") {
        const noti = data.message;
        let title = "Thông báo mới";
        let message = "Bạn có thông báo mới!";

        if (noti.sender) {
          const senderName = noti.sender.full_name || noti.sender.username;
          if (noti.type === "Like") {
            title = "Lượt thích mới";
            message = `${senderName} đã thích bài viết: ${noti.post?.title}`;
          } else if (noti.type === "Comment") {
            title = "Bình luận mới";
            message = `${senderName} đã bình luận bài viết: ${noti.post?.title}`;
          } else if (noti.type === "Follow") {
            title = "Người theo dõi mới";
            message = `${senderName} đã bắt đầu theo dõi bạn.`;
          }
        }

        setNotifications((prev) => [noti, ...prev]);
        setUnreadCount((prev) => prev + 1);
        Toast("info", message, title);
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
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
  };

  return (
    <WebSocketContext.Provider value={wsValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
