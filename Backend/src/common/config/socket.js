// Thin holder for the Socket.IO server instance. The HTTP server creates
// the io instance (see server.js) and stores it here so controllers can
// emit real-time events without circular imports.

let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO is not initialized");
  }

  return ioInstance;
};

export { setIO, getIO };
