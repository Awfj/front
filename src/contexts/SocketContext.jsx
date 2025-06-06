import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { UserContext } from "../App";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userAuth } = useContext(UserContext);

  useEffect(() => {
    if (userAuth?.access_token) {
      const newSocket = io(import.meta.env.VITE_SERVER_DOMAIN, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: {
          token: userAuth.access_token,
        },
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        newSocket.emit("user_connected", userAuth._id);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [userAuth?.access_token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
