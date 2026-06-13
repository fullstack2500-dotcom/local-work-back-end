// socket.ts
import { Server } from "socket.io";

let io: Server;




export const initSocket = (server: any) => {
  console.log("INIT SOCKET");

  io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};