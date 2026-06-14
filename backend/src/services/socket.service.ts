import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static io: SocketIOServer | null = null;
  private static userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  static init(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Allow all origins for dev simplicity
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        const sockets = this.userSockets.get(userId) || [];
        sockets.push(socket.id);
        this.userSockets.set(userId, sockets);
      }

      // Live Coding Contest room
      socket.on('join_contest', (contestId: string) => {
        socket.join(`contest_${contestId}`);
      });

      socket.on('leave_contest', (contestId: string) => {
        socket.leave(`contest_${contestId}`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (userId) {
          const sockets = this.userSockets.get(userId) || [];
          const index = sockets.indexOf(socket.id);
          if (index !== -1) {
            sockets.splice(index, 1);
          }
          if (sockets.length === 0) {
            this.userSockets.delete(userId);
          } else {
            this.userSockets.set(userId, sockets);
          }
        }
      });
    });
  }

  // Send real-time event to specific user
  static sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && this.io) {
      sockets.forEach((socketId) => {
        this.io!.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  // Broadcast event globally
  static broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      return true;
    }
    return false;
  }

  // Broadcast to contest room
  static broadcastToContest(contestId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`contest_${contestId}`).emit(event, data);
      return true;
    }
    return false;
  }
}
