"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { useToast } from "./use-toast";
import type { FlagEvent } from "@/lib/redis";

export function useRealtime() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const initSocket = () => {
      console.log("🔌 Initializing socket connection...");

      const socket = io({
        auth: {
          test: true,
        },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to real-time server");
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from real-time server");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      socket.on("flag_event", (event: FlagEvent) => {
        handleFlagEvent(event);
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user]);

  const handleFlagEvent = (event: FlagEvent) => {
    if (event.user.id === session?.user?.id) return;

    const userName = event.user.name || event.user.email;
    const flagName = event.flag.key;

    let title = "";
    let description = "";

    switch (event.type) {
      case "flag_created":
        title = "New Feature Flag Created";
        description = `${userName} created "${flagName}"`;
        break;
      case "flag_updated":
        title = "Feature Flag Updated";
        description = `${userName} updated "${flagName}"`;
        if (event.changes?.enabled) {
          description += ` (${
            event.changes.enabled.from ? "disabled" : "enabled"
          } → ${event.changes.enabled.to ? "enabled" : "disabled"})`;
        }
        break;
      case "flag_deleted":
        title = "Feature Flag Deleted";
        description = `${userName} deleted "${flagName}"`;
        break;
    }

    toast({
      title,
      description,
      duration: 5000,
    });

    window.dispatchEvent(
      new CustomEvent("flag_updated", {
        detail: event,
      })
    );
  };

  return {
    isConnected,
    connectionError,
    socket: socketRef.current,
  };
}
