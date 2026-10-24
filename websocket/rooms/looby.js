const lobby = new Set();

export const joinLobby = (socket) => {
  lobby.add(socket);
};

export const leaveLobby = (socket) => {
  lobby.delete(socket);
};

export const broadcastToLobby = (type, payLoad) => {
  const message = JSON.stringify({
    type,
    payLoad,
  });

  for (const socket of lobby) {
    if (socket.readyState === 1) {
      socket.send(message);
    } else {
      lobby.delete(socket);
    }
  }
};

export default lobby;
