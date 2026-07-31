import "dotenv/config";
import http from "node:http";
import app from "./src/app.js";
import { Server } from "socket.io";
import connectDB from "./src/common/config/db.js";
import { setIO } from "./src/common/config/socket.js";
import { verifyAccessToken } from "./src/common/utils/jwt.utils.js";
import Poll from "./src/modules/polls/poll.model.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log(`A new socket has connected`, socket.id);

  socket.on("poll:join_owner", async ({ pollId }) => {
    try {
      const rawCookies = socket.handshake.headers.cookie || "";
      const accessCookie = rawCookies
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("accessToken="));
      const token = accessCookie ? decodeURIComponent(accessCookie.slice("accessToken=".length)) : null;
      if (!token) {
        return socket.emit("poll:error", { message: "Unauthorized" });
      }

      const decoded = verifyAccessToken(token);
      const poll = await Poll.findOne({
        _id: pollId,
        createdBy: decoded.userId,
      });
      if (!poll) {
        return socket.emit("poll:error", { message: "Forbidden" });
      }

      socket.join(`poll:owner:${pollId}`);
    } catch {
      socket.emit("poll:error", { message: "Unauthorized" });
    }
  });

  socket.on("poll:join_public", ({ slug }) => {
    if (!slug) return;
    socket.join(`poll:public:${slug}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};

server.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

startServer().catch((error) => {
  console.error("Failed to bootstrap server:", error.message);
  process.exit(1);
});
