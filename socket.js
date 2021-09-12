let io;
exports.init = (httpServer) => {
  io = require("socket.io")(httpServer);
};
exports.getIO = () => {
  if (!io) {
    throw new Error("socket not init");
  }
  return io;
};
