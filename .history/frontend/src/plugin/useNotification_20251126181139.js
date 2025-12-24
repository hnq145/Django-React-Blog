import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiInstance from "../utils/axios";
import { useWebSocket } from "../context/WebSocketProvider"; // Import the WebSocket hook
import Toast from "./Toast";
import { useTranslation } from "react-i18next";

const useNotification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notification } = useWebSocket(); // Get notification from WebSocket context
  const [processedNotiIds, setProcessedNotiIds] = useState(new Set()); // Use a Set for efficient lookups

  useEffect(() => {
    if (notification && !processedNotiIds.has(notification.id)) {
      let icon = "";
      let title = "";
      if (notification.type === "Like") {
        icon = "success";
        title = t("notifications.newLike");
      } else if (notification.type === "Comment") {
        icon = "info";
        title = t("notifications.newComment");
      } else if (notification.type === "Bookmark") {
        icon = "warning";
        title = t("notifications.newBookmark");
      }

      Toast(
        icon,
        title,
        notification.post.title,
        "bottom-end",
        5000,
        () => {
          navigate(`/post/${notification.post.slug}/`);
          markAsSeen(notification.id);
        }
      );

      // Add the notification id to the processed set
      setProcessedNotiIds(prev => new Set(prev).add(notification.id));
    }
  }, [notification, navigate, t, processedNotiIds]); // Rerun when a new notification arrives

  const markAsSeen = async (notiId) => {
    try {
      await apiInstance.post(`author/dashboard/noti-mark-seen/`, {
        noti_id: notiId,
      });
    } catch (error) {
      console.error(error);
    }
  };
};

export default useNotification;

