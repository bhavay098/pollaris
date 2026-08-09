import "dotenv/config";
import http from "node:http";
import app from "./src/app.js";
import { Server } from "socket.io";
import connectDB from "./src/common/config/db.js";
import { setIO } from "./src/common/config/socket.js";
import { auth } from "./src/common/config/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import Poll from "./src/modules/polls/poll.model.js";

const PORT = process.env.PORT || 3000;

// Create the HTTP server from the Express app so Socket.IO can attach to the same server.
const server = http.createServer(app);

// Socket.IO handles realtime poll updates and uses the frontend URL for CORS in development/production.
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log(`A new socket has connected`, socket.id);

  // Owners can join a private room for their poll after we verify their session and ownership.
  socket.on("poll:join_owner", async ({ pollId }) => {
    try {
      // Read the current session from the incoming socket headers.
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.handshake.headers),
      });
      if (!session?.user) {
        return socket.emit("poll:error", { message: "Unauthorized" });
      }

      // Make sure the logged-in user actually created this poll before letting them in.
      const poll = await Poll.findOne({
        _id: pollId,
        createdBy: session.user.id,
      });
      if (!poll) {
        return socket.emit("poll:error", { message: "Forbidden" });
      }

      socket.join(`poll:owner:${pollId}`);
    } catch {
      // Any auth/session lookup failure is treated as unauthorized for safety.
      socket.emit("poll:error", { message: "Unauthorized" });
    }
  });

  // Public viewers only need the poll slug to join the shared room.
  socket.on("poll:join_public", ({ slug }) => {
    if (!slug) return;
    socket.join(`poll:public:${slug}`);
  });

  // Helpful logging for debugging connection lifecycle events.
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB first, then start listening for HTTP and socket traffic.
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};

// Surface startup errors immediately and exit instead of leaving the process half-started.
server.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

// Boot the server and treat bootstrap failures as fatal.
startServer().catch((error) => {
  console.error("Failed to bootstrap server:", error.message);
  process.exit(1);
});
