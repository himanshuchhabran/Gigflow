const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); 
const { Server } = require('socket.io');
const database = require("./config/db");
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes');

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


app.use(express.json());
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

app.get('/', (req, res) => {
  res.send('GigFlow API is running...');
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // We will add the hire notification logic here later
  
  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

app.set('socketio', io);


app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({ success: false, status, message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});