export default function errorHandler(socket, err) {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "SERVER_ERROR";

  switch (errorCode) {
    case "INVALID_MESSAGE":
      statusCode = 400;
      break;
    case "INVALID_PAYLOAD":
      statusCode = 400;
      break;
    case "MISSING_MESSAGE":
      statusCode = 400;
      break;
    case "MESSAGE_PARSE_ERROR":
      statusCode = 400;
      break;
    case "MESSAGE_EMPTY":
      statusCode = 400;
      break;
    case "MESSAGE_TOO_LONG":
      statusCode = 400;
      break;
    case "SEND_MESSAGE_FAILED":
      statusCode = 500;
      break;
    case "NOT_AUTHENTICATED":
      statusCode = 401;
      break;
    case "INVALID_TOKEN":
      statusCode = 401;
      break;
    case "TOKEN_EXPIRED":
      statusCode = 401;
      break;
    case "PERMISSION_DENIED":
      statusCode = 403;
      break;
    case "ROOM_NOT_FOUND":
      statusCode = 404;
      break;
    case "NOT_IN_ROOM":
      statusCode = 400;
      break;
    case "ALREADY_IN_ROOM":
      statusCode = 409;
      break;
    case "ROOM_JOIN_FAILED":
      statusCode = 500;
      break;
    case "ROOM_LEAVE_FAILED":
      statusCode = 500;
      break;
    case "DATA_NOT_FOUND":
      statusCode = 404;
      break;
    case "DATA_ALREADY_EXISTS":
      statusCode = 409;
      break;
    case "VALIDATION_ERROR":
      statusCode = 400;
      break;
    case "DATABASE_ERROR":
      statusCode = 500;
      break;
    case "CONNECTION_ERROR":
      statusCode = 500;
      break;
    case "CONNECTION_CLOSED":
      statusCode = 400;
      break;
    case "INVALID_WEBSOCKET_MESSAGE":
      statusCode = 400;
      break;
    case "SERVER_ERROR":
      statusCode = 500;
      break;
    default:
      statusCode = err.statusCode || 500;
      errorCode = err.errorCode || "SERVER_ERROR";
  }
  if (err.name === "CastError") {
    statusCode = 404;
    errorCode = "DATA_NOT_FOUND";
  }
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DATA_ALREADY_EXISTS";
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
  }
  if (socket.readyState === socket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "ERROR",
        payLoad: {
          success: false,
          statusCode,
          error: errorCode,
        },
      }),
    );
  }
}
