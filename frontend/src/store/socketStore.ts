import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface SocketState {
  socket: Socket | null;
  notifications: LiveNotification[];
  isConnecting: boolean;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  addNotification: (notification: LiveNotification) => void;
  clearNotifications: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  notifications: [],
  isConnecting: false,
  connectSocket: (userId: string) => {
    if (get().socket) return;

    set({ isConnecting: true });
    // Connect to Express Socket.IO server
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketInstance = io(backendUrl, {
      query: { userId }
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO Connected to Server');
      set({ socket: socketInstance, isConnecting: false });
    });

    // Handle incoming real-time notifications
    socketInstance.on('notification', (data: LiveNotification) => {
      set((state) => ({
        notifications: [data, ...state.notifications]
      }));
    });

    // Handle global contest broadcasts
    socketInstance.on('contest_alert', (data: any) => {
      set((state) => ({
        notifications: [{
          id: Math.random().toString(),
          title: '🏆 Coding Contest Live!',
          message: data.message || 'A new mock placement coding contest has begun.',
          type: 'COMPANY',
          createdAt: new Date().toISOString()
        }, ...state.notifications]
      }));
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
      set({ socket: null, isConnecting: false });
    });
  },
  disconnectSocket: () => {
    const activeSocket = get().socket;
    if (activeSocket) {
      activeSocket.disconnect();
      set({ socket: null });
    }
  },
  addNotification: (notification) => {
    set((state) => ({ notifications: [notification, ...state.notifications] }));
  },
  clearNotifications: () => set({ notifications: [] })
}));
