// Set socket io dependecies, initialize variables that define
// chat state

const socketio = require("socket.io"),
      guestNumber = 1,
      nickNames = {},
      namesUsed = [],
      currentRoom = {};

// Add logic to define the chat server function listen
// limit the verbosity of SocketIO logs in console
// establish how each incoming connection should be handled
exports.listen = (server) => {
  io = socketio.listen(server);
  io.set("log level", 1);

  io.sockets.on("connection", (socket) => {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, "Lobby");

    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on("rooms", () => {
      socket.emit("rooms", io.sockets.manager.rooms);
    });

    handleClientDisconnection(socket, nicknames, namesUsed)
  });
};

// Implement helper functions
// Assigning guest names
const assignGuestName = (
  socket,
  guestNumber,
  nickNames,
  namesUsed
) => {
  let name = "Guest" + guestNumber; // generate new guest name
  nickNames[socket.id] = name; //associate guest name with client connection ID
  socket.emit("nameResult", {
    success: true,
    name: name
  });
  namesUsed.push(name); // note that guest name is now used
  return guestNumber + 1; //increment counter used to generate guest names
}

// Implement joining room
const joinRoom = (socket, room) => {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit("joinResult", {room: room});
  socket.broadcast.to(room).emit("message", {
    text: nickNames[socket.id] + " has joined " + room + "."
  });

  const usersInRoom = io.sockets.clients(room);
  if(usersInRoom.length > 1){
    const usersInRoomSummary = "Users currently in " + room + ": ";
    for (const index in usersInRomm){
      const userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id){
        if(index > 0){
	  usersInRoomSummary += ", ";
	  usersInRoomSummary += nickNames[userSocketId];
	}
      }
	  usersInRoomSummary += ".";
	  socket.emit("message", {text:usersInRoomSummary})
    }
  }
}
