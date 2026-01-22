import React, { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import apiInstance from "../utils/axios";
import { useAuthStore } from "../store/auth"; // If needed for user ID
import ChatContext from "./ChatContext";

export const ChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([]); // List of { user: {id, username, ...}, isMinimized: boolean }
  const [newMessage, setNewMessage] = useState(null); // For subscribers to listen to recent messages
  const [socket, setSocket] = useState(null);

  // Store simple contact list for the right sidebar
  const [contacts, setContacts] = useState([]);

  // Helper to add a chat to active windows
  const openChat = (user) => {
    // Check if already open
    if (!activeChats.find((c) => c.user.id === user.id)) {
      // Limit to 3 open chats for UI sanity
      const newChats = [...activeChats];
      if (newChats.length >= 3) {
        newChats.shift(); // Remove oldest
      }
      newChats.push({ user, isMinimized: false });
      setActiveChats(newChats);
    } else {
      // Restore if minimized
      setActiveChats((prev) =>
        prev.map((c) =>
          c.user.id === user.id ? { ...c, isMinimized: false } : c,
        ),
      );
    }
  };

  const closeChat = (userId) => {
    setActiveChats((prev) => prev.filter((c) => c.user.id !== userId));
  };

  const minimizeChat = (userId) => {
    setActiveChats((prev) =>
      prev.map((c) =>
        c.user.id === userId ? { ...c, isMinimized: !c.isMinimized } : c,
      ),
    );
  };

  // Fetch contacts for sidebar
  // Fetch contacts for sidebar
  // DEPENDENCY FIX: Now depends on userId so it re-creates when user logs in
  const user = useAuthStore((state) => state.user); // Subscribe to user state

  const fetchContacts = useCallback(async () => {
    const userId = user?.user_id;
    if (!userId) return;
    try {
      const res = await apiInstance.get(`chat/inbox/${userId}/`);
      setContacts(res.data);
    } catch (error) {
      console.error("Failed to fetch sidebar contacts", error);
    }
  }, [user]);

  // Store online users
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // WebSocket Logic
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);

    ws.onopen = () => {
      console.log("Global Chat WS Connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        const msg = data.message;
        setNewMessage(msg); // Broadcast
        fetchContacts(); // Update sidebar "latest message" preview

        // Auto-open chat if not open?
        // Logic: If msg is from someone else, and we don't have chat open, should we open it?
        // User said "appear in chat frame". Let's auto-open.
        const currentUserId = user?.user_id;
        const senderId =
          typeof msg.sender === "object" ? msg.sender.id : msg.sender;

        if (String(senderId) !== String(currentUserId)) {
          // Check if chat corresponds to sender
          // We need sender info. `msg` usually has `sender_profile` or `sender` obj.
          // Let's assume msg.sender_profile has info.
          const senderProfile = msg.sender_profile || {
            user: { id: senderId },
          }; // Fallback

          // Construct user object consistent with our app
          const userObj = {
            id: senderId,
            username: senderProfile.user?.username || "User",
            full_name: senderProfile.full_name,
            image: senderProfile.image,
          };

          // We use functional update to access latest activeChats state if we were inside closure,
          // but here we might need a ref or rely on the state updater.
          // However, accessing activeChats directly here might be stale if not dependency.
          // Let's use setActiveChats callback.
          setActiveChats((prev) => {
            const exists = prev.find((c) => c.user.id === senderId);
            if (!exists) {
              const newChats = [...prev];
              if (newChats.length >= 3) newChats.shift();
              newChats.push({ user: userObj, isMinimized: false });
              return newChats;
            }
            return prev;
          });
        }
      }

      if (data.type === "user_status") {
        const { user_id, status } = data;
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (status === "online") {
            newSet.add(String(user_id));
          } else {
            newSet.delete(String(user_id));
          }
          return newSet;
        });
      }
    };

    ws.onclose = () => {
      console.log("Global Chat WS Disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [fetchContacts, user]); // Added user dependency to ensure we use latest user info in closure if needed, though mostly fetched via closure state or not used. Ideally socket should depend on token/user login.

  // Initial fetch of contacts
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [fetchContacts, user]);

  return (
    <ChatContext.Provider
      value={{
        activeChats,
        openChat,
        closeChat,
        minimizeChat,
        contacts,
        fetchContacts,
        newMessage,
        socket,
        onlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
