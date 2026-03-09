import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { AccessToken } from 'livekit-server-sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 4000;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

// Meeting token generation
app.post('/api/token', async (req, res) => {
    const { room, username } = req.body;
    console.log(`Token request for room: ${room}, user: ${username}`);

    if (!room || !username) {
        console.warn('Token request failed: Missing room or username', { room, username });
        return res.status(400).json({ error: 'Missing room or username' });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: username,
    });

    at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

    res.json({ token: await at.toJwt() });
});

// Socket.io for signals (Reactions, Raise Hand, etc.)
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('signal', (data) => {
        // Broadcast signal (reaction, raise hand, etc.) to everyone in the room except sender
        socket.to(data.roomId).emit('signal', {
            type: data.type,
            payload: data.payload,
            sender: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
