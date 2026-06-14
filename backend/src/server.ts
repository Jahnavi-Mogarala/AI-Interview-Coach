import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { SocketService } from './services/socket.service';

// Load environment configurations
dotenv.config();

const app = express();
const server = http.createServer(app);

// Global middleware configurations
app.use(cors({
  origin: '*', // Allow connections from Next.js server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default status probe
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Bind API endpoint prefix
app.use('/api', apiRouter);

// Initialize Socket.IO connection manager
SocketService.init(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`============================================`);
  console.log(`  JAJO AI Placement Mentor Express Server    `);
  console.log(`  Running on: http://localhost:${PORT}      `);
  console.log(`  Real-time Socket.IO: Active              `);
  console.log(`  AI Engine Mode: ${process.env.OPENAI_API_KEY ? 'OpenAI Live' : 'Sandbox Fallback (Mock)'} `);
  console.log(`============================================`);
});
