const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173', // ✅ Frontend origin (env or fallback)
      methods: ['GET', 'POST'],
      credentials: true // ✅ Allow cookies and authentication
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // ✅ Add your real-time event handlers here
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });

    // Example: Listen for a custom event
    // socket.on('task:updated', (data) => {
    //   socket.broadcast.emit('task:refresh', data);
    // });
  });

  return io;
}

module.exports = initSocket;
