import cors from "cors"
import http from "http"
import express from "express"
import { WebSocketServer } from "ws"
import Router from './routes/match.routes'
import predictionRouter from "./routes/predictionRoutes"
import geminiRouter from "./routes/geminiRoutes"
import chatRouter from "./routes/chat"
import { CONFIG } from "./config/env"
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const broadcastRefresh = () => {
  const payload = JSON.stringify({ type: "refresh" });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
};

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.send(JSON.stringify({ type: "system", message: "Connected to SoccerPredictor live feed" }));

  ws.on("message", (message) => {
    try {
      const payload = JSON.parse(message.toString());
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "message", payload }));
        }
      });
    } catch {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "message", payload: message.toString() }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

setInterval(() => {
  broadcastRefresh();
}, 30000);

// Allow your React frontend to talk to this backend
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
  console.log(`>>> INCOMING REQUEST: ${req.method} ${req.url}`);
  next();
});

// All football routes live under /api
app.use('/api', Router);
app.use("/api/groq", geminiRouter);
app.use("/api/predict", predictionRouter);
app.use("/api", chatRouter);
const port = Number(CONFIG.PORT) || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
