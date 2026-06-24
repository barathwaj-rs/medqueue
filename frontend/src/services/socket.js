import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.info("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.info("Socket disconnected:", reason);
});

export default socket;
