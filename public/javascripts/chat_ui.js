const divEscapedContentElement = (message) => {
  return $("<div></div>").text(message);
}

const divSystemContentElement = (message) => {
  return $("<div></div>").html("<i>" + message + "</i>");
}

const processUserInput = (chatApp, socket) => {
  const message = $("#send-message").val();
  let systemMessage;

  if (message.charAt(0) == "/") {
    systemMessage = chatApp.processCommand(message);
    if(systemMessage){
      $("#messages").append(divSystemContentElement(systemMessage));
    } 
  } else {
    chatApp.sendMessage($("#room").text(), message);
    $("#messages").append(divEscapedContentElement(message));
    $("#messages").scrollTop($("#messages").prop("scrollHeight"));
  }
  $("#send-message").val("");
}

