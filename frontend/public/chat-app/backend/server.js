const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { setupSocket } = require('./utils/socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/friend-requests', require('./routes/friendRequestRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
