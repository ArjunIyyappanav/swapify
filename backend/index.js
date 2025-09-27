import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose';
import authrouter from './routes/authRoutes.js'
import requestsrouter from './routes/requestRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import meetingRouter from './routes/meetingRoutes.js'
import ratingRouter from './routes/ratingRoutes.js'
import blockRouter from './routes/blockRoutes.js'
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Match from './models/match.js';
import Message from './models/message.js';
import teamrouter from './routes/teamRoutes.js';


dotenv.config()
const app = express()

app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }))
app.use(express.json())
console.log(process.env.FRONTEND_ORIGIN,process.env.PORT,process.env.MONGODB_URI);

app.use('/api',authrouter);
app.use('/api',requestsrouter);
app.use('/api',chatRouter);
app.use('/api',teamrouter);
app.use('/api',meetingRouter);
app.use('/api',ratingRouter);
app.use('/api',blockRouter);

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: process.env.FRONTEND_ORIGIN, credentials: true }
});


app.set('io', io);

function parseCookie(cookieHeader) {
  return (cookieHeader || '').split(';').reduce((acc, part) => {
    const [k, v] = part.trim().split('=');
    if (k) acc[k] = decodeURIComponent(v || '');
    return acc;
  }, {});
}

io.use((socket, next) => {
  try {
    const cookies = parseCookie(socket.handshake.headers?.cookie);
    const token = cookies?.jwt;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.data.userId = decoded.id;
    next();
  } catch (e) {
    next(e);
  }
});

io.on('connection', (socket) => {
  socket.on('join', async ({ matchId }) => {
    try {
      const match = await Match.findById(matchId);
      if (!match) return;
      const uid = String(socket.data.userId);
      if (String(match.user1) !== uid && String(match.user2) !== uid) return;
      socket.join(`match:${matchId}`);
    } catch {}
  });

  socket.on('message', async ({ matchId, content }) => {
    try {
      if (!content || !content.trim()) return;
      const match = await Match.findById(matchId);
      if (!match) return;
      const uid = String(socket.data.userId);
      if (String(match.user1) !== uid && String(match.user2) !== uid) return;
      const recipient = String(match.user1) === uid ? match.user2 : match.user1;
      const msg = await Message.create({ match: matchId, sender: uid, recipient, content: content.trim() });
      // Ensure the sender sees their own message immediately, even if not in the room yet
      socket.emit('message', msg);
      // Send to the other participant(s) in the match room
      socket.to(`match:${matchId}`).emit('message', msg);
    } catch {}
  });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        app.listen(process.env.PORT, ()=>{
            console.log("Connection successful, App listening on port " + process.env.PORT);
        })
    })
