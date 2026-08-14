// Shared Socket.IO client used for realtime updates (live responses, poll
// status changes). It's a singleton so every page uses the same connection.
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  // autoConnect is off: each page that needs realtime data calls
  // socket.connect() explicitly and disconnects on cleanup.
  autoConnect: false,
});

export default socket;
