import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignee', 'username email')
            .populate('project', 'name');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching tasks',
            error: error.message
        });
    }
});

// GET
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'username email')
            .populate('project', 'name');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching task',
            error: error.message
        });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            dueDate,
            priority,
            status,
            assignee,
            project
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const newTask = await Task.create({
            title,
            description,
            startDate,
            dueDate,
            priority,
            status,
            assignee,
            project
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating task',
            error: error.message
        });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating task',
            error: error.message
        });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({
            message: 'Task deleted successfully',
            task: deletedTask
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting task',
            error: error.message
        });
    }
});

export default router;