const http = require("http"),
      fs = require("fs"),
      path = require("path"),
      mime = require("mime"),
      cache = {},

      chatServer = require("./lib/chat_server")


// HANDLE 404
const send404 = (response) => {
  response.writeHead(404, {"Content-Type":"text/plain"});
  response.write("Error 404: Resouce not found.");
  response.end();
}

// SERVE THE FILE DATA
const sendFile = (response, filePath, fileContents) => {
  response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

// SERVE STATIC FILES
const serveStatic = (response, cache, absPath) => {
  if(cache[absPath]){
    sendFile(response, absPath, cache[absPath])
  } else {
    fs.exists(absPath, (exists) =>{
      if(exists){
        fs.readFile(absPath, (err, data) => {
	  if(err){
	    send404(response);
	  }else{
	    cache[absPath] = data;
	    sendFile(response, absPath, data);
	  }
	});
      } else {
        send404(response);
      }
    })
  }
}

//CREATE THE HTTP SERVER
const server = http.createServer((request, response) => {
  let filePath = false;

  if(request.url == "/"){
    filePath = "public/index.html";
  } else {
    filePath = "public" + request.url;
  }

  const absPath = "./" + filePath;
  serveStatic(response, cache, absPath);

});
// RUN THE CHAT SERVER
chatServer.listen(server);

// START THE HTTP SERVER
server.listen(3000, () => {
  console.log("server listening on port 3000")
});
