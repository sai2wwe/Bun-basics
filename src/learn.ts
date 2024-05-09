import { Hono } from "hono";
import { stream, streamSSE, streamText} from 'hono/streaming';
let files: string[] = [];

const app = new Hono();

app.get("/", (ctx) => {

    return ctx.html('<h1>This is Tutorial</h1>')
});

app.post('/files', async (ctx)=> {
    const { file } = await ctx.req.json();
    files.push(file);
    return ctx.json({ files });
})

app.get('/project', (ctx) => {
    return streamText(ctx, async(stream) => {
        for (let file of files) {
            await stream.writeln(JSON.stringify(file));
            await stream.sleep(1000);
        }
        
    })
})

export default app;