import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db.js';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    // Client joins a specific show auditorium room
    socket.on('join:show', ({ showId }: { showId: string }) => {
      if (showId) {
        socket.join(`show:${showId}`);
      }
    });

    // Client leaves a show room
    socket.on('leave:show', ({ showId }: { showId: string }) => {
      if (showId) {
        socket.leave(`show:${showId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnect cleanup if needed
    });
  });

  // Start background reaper interval for expired seat holds (every 8 seconds)
  setInterval(() => {
    const expiredSeats = db.reapExpiredHolds();
    if (expiredSeats.length > 0 && ioInstance) {
      // Group by showId
      const byShow: Record<string, string[]> = {};
      for (const item of expiredSeats) {
        if (!byShow[item.showId]) byShow[item.showId] = [];
        byShow[item.showId].push(item.seatId);
      }

      for (const [showId, seats] of Object.entries(byShow)) {
        ioInstance.to(`show:${showId}`).emit('seat:released', {
          showId,
          seatIds: seats,
          reason: 'hold_expired',
        });
      }
    }
  }, 8000);

  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastSeatHeld(showId: string, seatIds: string[], userId: string, expiresAt: string) {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat:held', {
      showId,
      seatIds,
      heldByUserId: userId,
      heldUntil: expiresAt,
    });
  }
}

export function broadcastSeatReleased(showId: string, seatIds: string[]) {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat:released', {
      showId,
      seatIds,
    });
  }
}

export function broadcastSeatBooked(showId: string, seatIds: string[], bookingId: string) {
  if (ioInstance) {
    ioInstance.to(`show:${showId}`).emit('seat:booked', {
      showId,
      seatIds,
      bookingId,
    });
  }
}
