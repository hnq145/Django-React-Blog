import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import apiInstance from "../utils/axios";
import { useAuthStore } from "../store/auth"; // If needed for user ID

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

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
  const fetchContacts = useCallback(async () => {
    const userId = useAuthStore.getState().user?.user_id;
    if (!userId) return;
    try {
      const res = await apiInstance.get(`chat/inbox/${userId}/`);
      setContacts(res.data);
    } catch (error) {
      console.error("Failed to fetch sidebar contacts", error);
    }
  }, []);

  const [typingUsers, setTypingUsers] = useState({});
  const [readReceipt, setReadReceipt] = useState(null);

  // ... (existing code)

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

        // Auto-open chat logic ... (keep existing)
        const currentUserId = useAuthStore.getState().user?.user_id;
        const senderId =
          typeof msg.sender === "object" ? msg.sender.id : msg.sender;

        if (String(senderId) !== String(currentUserId)) {
          // Play notification sound
          try {
            const audio = new Audio(
              "https://cdn.freesound.org/previews/573/573455_12886737-lq.mp3",
            ); // Example sound
            audio.play().catch((e) => console.log("Audio play failed", e));
          } catch (e) {}

          const senderProfile = msg.sender_profile || {
            user: { id: senderId },
          };

          const userObj = {
            id: senderId,
            username: senderProfile.user?.username || "User",
            full_name: senderProfile.full_name,
            image: senderProfile.image,
          };

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
      } else if (data.type === "typing") {
        setTypingUsers((prev) => ({ ...prev, [data.sender_id]: true }));
      } else if (data.type === "stopped_typing") {
        setTypingUsers((prev) => ({ ...prev, [data.sender_id]: false }));
      } else if (data.type === "seen") {
        setReadReceipt({ userId: data.sender_id, timestamp: Date.now() });
      }
    };

    ws.onclose = () => {
      console.log("Global Chat WS Disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [fetchContacts]);

  const sendTyping = useCallback(
    (receiverId, isTyping) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: isTyping ? "typing" : "stopped_typing",
            receiver_id: receiverId,
          }),
        );
      }
    },
    [socket],
  );

  const sendSeen = useCallback(
    (senderId) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "seen",
            sender_id: senderId,
          }),
        );
      }
    },
    [socket],
  );

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
        typingUsers,
        readReceipt,
        sendTyping,
        sendSeen,
        onlineUsers: new Set(), // Placeholder if not implemented yet, or remove from destructuring in consumers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
