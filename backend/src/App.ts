import cors from "cors"
import http from "http"
import express from "express"
import Router from "./routes/match.routes.ts"
import { CONFIG } from "./config/env.ts"
import { initSocket } from "./sockets/matches.sockets.ts"
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const server = http.createServer(app);
initSocket(server);

// Allow your React frontend to talk to this backend
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }));

app.use(express.json());

// All football routes live under /api
// e.g. /api/matches/live, /api/standings, et
app.use('/api', Router);

app.listen(CONFIG.PORT, () => {
  console.log(`Server running on http://localhost:${CONFIG.PORT}`);
});
