import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { getToken } from "next-auth/jwt";
import { redisSub, CHANNELS, type FlagEvent } from "./redis";
import { prisma } from "./prisma";

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer) {
  if (io) {
    console.log("Socket.IO already initialized");
    return io;
  }

  console.log("Initializing Socket.IO server...");

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      console.log("Socket authentication attempt...");
      const sessionToken = socket.handshake.auth.sessionToken;

      if (!sessionToken) {
        console.log("No session token provided");
        return next(new Error("Session token required"));
      }

      console.log("Session token received, verifying...");

      const decoded = await getToken({
        token: sessionToken,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (!decoded || !decoded.id) {
        console.log("Invalid session token");
        return next(new Error("Invalid session"));
      }

      console.log("Session token valid, fetching user...");

      const user = await prisma.user.findUnique({
        where: { id: decoded.id as string },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        console.log("User not found in database");
        return next(new Error("User not found"));
      }

      console.log(`User authenticated: ${user.email}`);
      socket.data.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`✅ User ${user.email} connected`);

    socket.on("disconnect", () => {
      console.log(`❌ User ${user.email} disconnected`);
    });
  });

  setupRedisSubscription();

  console.log("✅ Socket.IO server initialized successfully");
  return io;
}

function setupRedisSubscription() {
  if (!io) {
    console.log("No Socket.IO instance for Redis subscription");
    return;
  }

  console.log("Setting up Redis subscription...");

  redisSub.subscribe(CHANNELS.FLAG_EVENTS());

  redisSub.on("subscribe", (channel, count) => {
    console.log(
      `✅ Subscribed to Redis channel: ${channel} (${count} subscriptions)`
    );
  });

  redisSub.on("message", (channel, message) => {
    try {
      console.log(`📨 Received Redis message on ${channel}`);
      const event: FlagEvent = JSON.parse(message);

      io!.emit("flag_event", event);

      console.log(`📡 Broadcasted ${event.type} for flag ${event.flag.key}`);
    } catch (error) {
      console.error("Error processing Redis message:", error);
    }
  });

  redisSub.on("error", (error) => {
    console.error("Redis subscription error:", error);
  });
}

export function getSocketIO() {
  return io;
}
