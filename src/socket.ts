import { ServerWebSocket } from "bun";

type WebSocketData = {
  username: string;
}

const server = Bun.serve<WebSocketData>({
  port: 4000,
  fetch(request) {
    if (server.upgrade(request, { data: {username: 'John'}})) return;
    return new Response("hello world");
  },
  websocket: {
    message: function (
      ws: ServerWebSocket<unknown>,
      message: string | Buffer
    ): void | Promise<void> {
      const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message)
      ws.sendText(`Your message is ${messageString}`);

    },
    open: function (ws: ServerWebSocket<unknown>): void {
      ws.sendText("Welcome to dubai");
      ws.subscribe('Space')
      const userData = ws.data as WebSocketData;
      server.publish("Space", `User ${userData.username} has joined the chat`);
      console.log("Space", `User ${userData.username} has joined the chat`);
    },
    close: function (ws: ServerWebSocket<unknown>): void {
      ws.unsubscribe('Space')
      const userData = ws.data as WebSocketData;
      server.publish("Space", `User ${userData.username} has left the chat`);
      console.log("Space", `User ${userData.username} has left the chat`);
      ws.sendText("See you again!!!");
    },
  },
});

console.log(`server is running on ${server.port}`);
