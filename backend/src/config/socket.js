const { Server } = require("socket.io");
require("dotenv").config();

const cors_origin = process.env.NODE_ENV === 'development' ? "http://localhost:5173" : "https://publicidadtd.com.ar";

function initialize(server) {
  const io = new Server(server, {
    cors: {
      origin: cors_origin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  const usuariosEnLinea = new Map();

  io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    const userId = socket.handshake.query.userId;
    usuariosEnLinea.set(userId, socket.id);

    const room = 'Guardarropa-TRL';
    socket.join(room);
    console.log(`Cliente unido a la sala: ${room}`);


    socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado');
      usuariosEnLinea.delete(userId);

      io.to(room).emit('clientDisconnected', { message: 'Un cliente se ha desconectado', userId });
    });

    socket.on('forceDisconnect', (targetUserId) => {
      const targetSocketId = usuariosEnLinea.get(targetUserId);
      if (targetSocketId) {
        io.sockets.sockets.get(targetSocketId).disconnect();
        usuariosEnLinea.delete(targetUserId);
        console.log(`Usuario ${targetUserId} desconectado por otro usuario`);
      }
    });
  });

  return io;
}

module.exports = { initialize };