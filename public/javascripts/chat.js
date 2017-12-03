const Chat = (socket) => {
   this.socket = socket; 
}

// Implement function to send message
Chat.prototype.sendMessage = (room, text) => {
  const message = {
    room : room,
    text : text
  };
  this.socket.emit("message", message)
};

// Implement function to change rooms
Chat.prototype.changeRoom = (room) => {
  this.socket.emit("join", {
    newRoom : room
  })
}

// Process the chat command join and nick
Chat.prototype = processCommand = (command) => {
  const words = command.split(" ");
  const command = words[0]
    .substring(1, words[0].length)
    .toLowerCase(); // Parse command from firs word
  const message = false;

  switch (command) {
    case "join":
      words.shift();
      const room = words.join(" ");
      this.changeRoom(room); // Handle room changing/creating
      break;

    case "nick":
      words.shift();
      const name = words.join(" ");
      this.socket.emit("nameAttempt", name); //Handle name change attempts
      break;
		
    default:
      message = "Unrecognized command."; // Return error message if command isn't recognized
      break;
  }
  return message;
} 
