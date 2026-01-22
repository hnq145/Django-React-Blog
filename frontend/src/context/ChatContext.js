import { createContext, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export default ChatContext;
