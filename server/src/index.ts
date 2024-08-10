import http from "http";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import cors from "cors";
import { fetch as fetchOG } from "fetch-opengraph";
import dotenv from "dotenv";
import multer from "multer";

import { UTApi } from "uploadthing/server";

dotenv.config();

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const utapi = new UTApi({
    apiKey: process.env.UPLOADTHING_SECRET,
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

interface Client {
    id: string;
    username: string;
    ws: WebSocket;
}

const clients: Client[] = [];

wss.on("connection", (ws, req) => {
    const id = uuidv4();
    const username = req.url?.split("=")[1] || "Anonymous";
    const client: Client = { id, username, ws };
    clients.push(client);

    ws.send(
        JSON.stringify({
            type: "ID",
            data: id,
        }),
    );

    broadcastUsers();

    ws.on("message", (message: string) => {
        const payload = JSON.parse(message);

        switch (payload.type) {
            case "MESSAGE":
                const targetClient = clients.find(
                    (client) => client.id === payload.data.to,
                );

                if (targetClient) {
                    targetClient.ws.send(
                        JSON.stringify({
                            type: "MESSAGE",
                            data: {
                                from: client.id,
                                timestamp: payload.data.timestamp,
                                content: payload.data.content,
                            },
                        }),
                    );
                }
                break;
        }
    });

    ws.on("close", () => {
        const clientIndex = clients.findIndex((client) => client.id === id);

        if (clientIndex !== -1) {
            clients.splice(clientIndex, 1);
            broadcastUsers();
        }
    });
});

function broadcastUsers() {
    const users = clients.map((client) => ({
        id: client.id,
        username: client.username,
    }));

    clients.forEach((client) =>
        client.ws.send(
            JSON.stringify({
                type: "USERS",
                data: users,
            }),
        ),
    );
}

app.get("/fetch-og", async (req, res) => {
    const { url } = req.query;
    try {
        const data = await fetchOG(url as string);
        return res.json(data);
    } catch (error) {
        return res
            .status(404)
            .json({ error: "Could not fetch Open Graph data" });
    }
});

app.post("/upload", upload.array("data"), async (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    const filesToUpload = files.map((file) => {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const fileEsque = Object.assign(blob, {
            name: file.originalname,
        });
        return fileEsque;
    });

    const upload = await utapi.uploadFiles(filesToUpload);

    const uploadedFiles = upload.map((file) => {
        if (!file.error) {
            return {
                name: file.data.name,
                url: file.data.url,
                type: file.data.type,
                size: file.data.size,
            };
        }
        return {
            error: file.error.message,
        };
    });

    return res.json({ success: true, files: uploadedFiles });
});

server.listen(8080, () => console.log("Server is running on port 8080"));
