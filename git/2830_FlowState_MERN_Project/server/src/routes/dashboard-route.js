import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignee', 'username email name')
            .populate('project', 'name');

        const projects = await Project.find()
            .populate('team', 'name')
            .populate('tasks', 'title status priority dueDate');

        res.json({
            message: 'Dashboard data loaded',
            projects,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error loading dashboard data',
            error: error.message
        });
    }
});

export default router;