import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { redisSub, CHANNELS, type FlagEvent } from "./redis";
import { prisma } from "./prisma";

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer) {
  if (io) {
    console.log("Socket.IO already initialized");
    return io;
  }

  console.log("🚀 Initializing Socket.IO server...");

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      console.log("🔐 Socket connection attempt...");

      const user = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        console.log("❌ No users found in database");
        return next(new Error("No users found"));
      }

      console.log(`✅ Using user: ${user.email}`);
      socket.data.user = user;
      next();
    } catch (error) {
      console.error("❌ Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`🔌 User connected: ${user.email}`);

    redisSub.subscribe(CHANNELS.FLAG_EVENTS(), (err) => {
      if (err) {
        console.error("❌ Failed to subscribe to flag events:", err);
      } else {
        console.log("✅ Subscribed to flag events");
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${user.email}`);
    });
  });

  redisSub.on("message", (channel, message) => {
    if (channel === CHANNELS.FLAG_EVENTS()) {
      try {
        const event: FlagEvent = JSON.parse(message);
        console.log(`📡 Broadcasting flag event: ${event.type}`);
        io?.emit("flag_updated", event);
      } catch (error) {
        console.error("❌ Error parsing flag event:", error);
      }
    }
  });

  return io;
}

export function getSocketIO() {
  return io;
}
