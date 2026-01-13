const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); 
const { Server } = require('socket.io');
const database = require("./config/db");

dotenv.config();


database.connect();

const app = express();
const server = http.createServer(app); // Wrap express app

// Socket.io Setup (Bonus Feature Ready)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Allow frontend
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true // Allow cookies with sockets
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser()); // Parses cookies attached to the client request
app.use(cors({
  origin: process.env.CLIENT_URL, // Must match frontend URL exactly
  credentials: true // Critical for HttpOnly Cookies
}));

// Placeholder for Routes (We will add these next)
app.get('/', (req, res) => {
  res.send('GigFlow API is running...');
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // We will add the hire notification logic here later
  
  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Make 'io' accessible in routes/controllers
app.set('socketio', io);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({ success: false, status, message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});