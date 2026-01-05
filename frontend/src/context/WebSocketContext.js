import { createContext, useContext } from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export default WebSocketContext;
