import { Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';

const app = new Hono().basePath('/api/v1');
const { upgradeWebSocket, websocket } = createBunWebSocket();

const wsApp = app.get('/ws', upgradeWebSocket((ctx) => {
    return {
        onMessage(event, ws) {
            console.log(`Message from client: ${event.data}`)

        },
        onClose() {
            console.log('Client disconnected');
        },
        onOpen() {
            console.log('Client connected');
        }

    }
}))

export default app;

const server = Bun.serve({
    port: 4000,
    fetch: app.fetch,
    websocket
})

console.log(`server is running on ${server.port}`);
