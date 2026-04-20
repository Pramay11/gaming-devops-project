const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', ws => {
  console.log("Client connected");

  ws.on('message', message => {
    console.log(`Received: ${message}`);

    // broadcast message to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    });
  });

  ws.send("Welcome to chat server");
});