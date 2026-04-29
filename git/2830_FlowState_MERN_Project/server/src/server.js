import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import taskRoutes from './routes/task-route.js';
import projectRoutes from './routes/project-route.js';
import authRoutes from './routes/authentication-route.js';
import dashboardRoutes from './routes/dashboard-route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'FlowState API is running' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

await db.connect();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});