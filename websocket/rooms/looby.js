import Orders from "../../model/orders.model";
const lobby = new Set();

export const joinLobby = async (socket) => {
  lobby.add(socket);
  const orders = Orders.find({ status: "open" });
  const message = {
    type: "show-lobby",
    payLoad: orders,
  };
  socket.send(message);
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
