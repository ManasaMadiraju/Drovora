import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
  io.on('connection', (socket: Socket) => {
    socket.on('driver:join', (driverId: string) => socket.join(`driver:${driverId}`));
    socket.on('user:join', (userId: string) => socket.join(`user:${userId}`));
    socket.on('pickup:track', (pickupId: string) => socket.join(`pickup:${pickupId}`));
  });
  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
