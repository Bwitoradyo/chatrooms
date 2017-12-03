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

// Define a function that handles request by user to change their names
const handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
  socket.on("nameAttempt", (name) => {  //add listener for nameAttemp events
    if(name.indexOf("Guest") == 0){  //don't allow nicknames to begin with Guest  
      socket.emit("nameResult", {
        success: false,
	message: 'Names cannot begin with "Guest".'
      });
    } else {
      if(namesUsed.indexOf(name) == -1){  // If name isn't already registered, register it
        const previousName = nickNames[socket.id];
	const previousNameIndex = nameUsed.indexOf(previousName);
	namesUsed.push(name);
	nickNames[socket.id] = name;
	delete namesUsed[previousNameIndex];  //Remove previous name to make available to other clients
	socket.emit("nameResult", {
	  success: true,
          name: name
	});
	socket.broadcast.to(currentRoom[socket.id]).emit("message", {
	  text: previousName + " is now known as " + name + "."
	});
      } else {
        socket.emit("nameResult", {  // Send error to client if name is already registered
	  success: false,
	  message: "That name is already in use"
	});
      }
    }    
  }); 
}

//  Define how a chat mwssage sent from a user
//  is handled
const handleMessageBroadcasting = (socket) => {
  socket.on("message", (message) => {
    socket.broadcast.to(message.room).emit("message", {
      text: nickNames[socket.id] + ": " + message.text
    })// end of emit
  })// end of socket.on
}//end of handleMessageBroadcasting


// Allow user to join and existin room or
// if it doesn't yet exist, to reate it
const handleRoomJoining = (socket) => {
  socket.on("join", (room) => {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom)
  })//end of socket.on
}//end of handleRoomJoining


// Remove a user's nick name from nickNames and namesUsed when
// the user leave the app
const handleClientDisconnection = (socket) => {
  socket.on("disconnect", () => {
    const nameIndex = nameUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    joinRoom(socket, room.newRoom)
  }); // end of socket.on
} // end of handleClientDisconnection





















































