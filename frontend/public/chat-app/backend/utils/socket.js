const socketio = require('socket.io');

function setupSocket(server) {
  const io = socketio(server, {
    cors: { origin: "*" }
  });

  io.on('connection', socket => {
    console.log('New client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('sendMessage', (message) => {
      io.to(message.room).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocket };
