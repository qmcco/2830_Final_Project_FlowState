import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import taskRoutes from './routes/task-route.js';
import projectRoutes from './routes/project-route.js';
import authRoutes from './routes/authentication-route.js';
import dashboardRoutes from './routes/dashboard-route.js';
import userRoutes from './routes/user-route.js';
import teamRoutes from './routes/team-route.js';
import authMiddleware from './middleware/auth-middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'FlowState API is running' });
});

// Public routes (no token required)
app.use('/api/auth', authRoutes);

// Protected routes (token required)
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/teams', authMiddleware, teamRoutes);

await db.connect();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});