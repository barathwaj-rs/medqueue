const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("queueUpdated", (queue) => {
  console.log("Queue Updated!");
  console.log(queue);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
