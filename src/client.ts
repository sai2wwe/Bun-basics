const socket = new WebSocket("ws://localhost:4000/");

socket.addEventListener("message", event => {
  console.log(event.data);
})