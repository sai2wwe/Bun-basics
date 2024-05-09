import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";

import mongoose, { isValidObjectId } from "mongoose";
import FileModel from "./models/fileModel";
import { stream, streamText } from "hono/streaming";

const app = new Hono();
app.use(poweredBy());
app.use(logger());



mongoose
  .connect("mongodb+srv://sai783191:RQForever@codeeditor.2pdusme.mongodb.net/?retryWrites=true&w=majority&appName=CodeEditor")
  .then(() => {
    console.log("Connected to MongoDB");
    
    app.get("/", async (ctx) => {
      const document = await FileModel.find();
      return ctx.json(
        document.map((doc) => doc.toObject()),
        200
      );
    });
    app.post("/", async (ctx) => {
      const formData = await ctx.req.json();
      if (!formData.title || !formData.content || !formData.size) {
        return ctx.json({ error: "Title and content are required" }, 400);
      }
      const document = new FileModel({
        title: formData.title,
        content: formData.content,
        size: formData.size,
        modified: formData.modified,
      });
      try {
        await document.save();
        return ctx.json(document.toObject(), 201);
      } catch (err: any) {
        return ctx.json({ error: err.message }, 400);
      }
    });
    app.get("/:fileId", async (ctx) => {
      const id = ctx.req.param("fileId");
      if (!isValidObjectId(id)) return ctx.json({ error: "Invalid ID" }, 400);
      const document = await FileModel.findById(id);
      if (!document) return ctx.json({ error: "Document not found" }, 404);
      return ctx.json(document.toObject(), 200);
    });
    app.get("/f/:fileId", async (ctx) => {
      const id = ctx.req.param("fileId");
      if (!isValidObjectId(id)) return ctx.json({ error: "Invalid ID" }, 400);
      const document = await FileModel.findById(id);
      if (!document) return ctx.json({ error: "Document not found" }, 404);
      return streamText(ctx, async stream => {
        stream.onAbort(() => {
          console.log("Stream aborted");
        });
        for (let i = 0; i < document.content.length; i++) {
          
          await stream.write(document.content[i]);
          await stream.sleep(10);
        }
      });
    });
    app.patch('/:fileId', async (ctx) => {
      const id = ctx.req.param('fileId');
      if (!isValidObjectId(id)) return ctx.json({ error: 'Invalid ID' }, 400);
      const document = await FileModel.findById(id);
      if (!document) return ctx.json({ error: 'Document not found' }, 404);
      const formData = await ctx.req.json();
      if (formData.title) document.title = formData.title;
      if (formData.content) document.content = formData.content;
      if (formData.size) document.size = formData.size;
      if (formData.modified) document.modified = formData.modified;
      try {
        await document.save();
        return ctx.json(document.toObject(), 200);
      } catch (err: any) {
        return ctx.json({ error: err.message }, 400);
      }
    });
    app.delete('/:fileId', async (ctx) => {
      const id = ctx.req.param('fileId');
      if (!isValidObjectId(id)) return ctx.json({ error: 'Invalid ID' }, 400);
      const document = await FileModel.findByIdAndDelete(id);
      if (!document) return ctx.json({ error: 'Document not found' }, 404);
      return ctx.json(document.toObject(), 200);
    });

  })
  .catch((err) => {
    app.get("/*", (ctx) => {
      return ctx.json({ error: err.message, database: true});
    });
  });

app.onError((err, ctx) => {
  return ctx.json({ error: err.message, app: true });
});

export default app;
