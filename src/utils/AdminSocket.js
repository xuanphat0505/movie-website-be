// User Events
export const SOCKET_EVENTS = {
  USER_ADDED: "userAdded",
  USER_UPDATED: "userUpdated",
  USER_DELETED: "userDeleted",
};

export const emitUserAdded = (io, data) => {
  if (!io) return;

  io.emit(SOCKET_EVENTS.USER_ADDED, data);
};

export const emitUserUpdated = (io, data) => {
  if (!io) return;

  io.emit(SOCKET_EVENTS.USER_UPDATED, data);
};

export const emitUserDeleted = (io, data) => {
  if (!io) return;

  io.emit(SOCKET_EVENTS.USER_DELETED, data);
};


