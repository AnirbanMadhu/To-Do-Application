// backend/server.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/auth');
const makeTaskRoutes = require('./routes/tasks');
const activityRoutes = require('./routes/activity');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4001';
const PORT = process.env.PORT || 4001;
const MONGO_URI = process.env.MONGO_URI ;

// --- Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// --- Middleware ---
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Attach io to requests for real-time updates in routes
app.use((req, res, next) => { req.io = io; next(); });

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/tasks', makeTaskRoutes(io));
app.use('/api/activity', activityRoutes);

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

// --- Database Connection ---
mongoose.connect(MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// --- Socket.IO Events ---
io.on('connection', socket => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
