const orders = new Map();

export const joinOrder = (orderId, socket) => {
  if (!orders.has(orderId)) {
    orders.set(orderId, new Set());
  }

  orders.get(orderId).add(socket);
};

export const leaveOrder = (orderId, socket) => {
  const order = orders.get(orderId);

  if (!order) return;

  order.delete(socket);

  if (order.size === 0) {
    orders.delete(orderId);
  }
};

export const broadcastToOrder = (orderId, type, payLoad) => {
  const order = orders.get(orderId);

  if (!order) return;

  const message = JSON.stringify({
    type,
    payLoad,
  });

  for (const socket of order) {
    if (socket.readyState === 1) {
      socket.send(message);
    } else {
      order.delete(socket);
    }
  }

  if (order.size === 0) {
    orders.delete(orderId);
  }
};

export default orders;
