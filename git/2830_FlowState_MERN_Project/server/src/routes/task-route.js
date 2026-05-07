import express from 'express';
import Task from '../models/Task.js';
import Team from '../models/Team.js';

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignee', 'username email')
            .populate('team', 'name');

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
            .populate('team', 'name');

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
            team
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
            team
        });

        // Add task to team's tasks array
        if (team) {
            await Team.findByIdAndUpdate(team, {
                $addToSet: { tasks: newTask._id }
            });
        }

        const populatedTask = await Task.findById(newTask._id)
            .populate('assignee', 'username email')
            .populate('team', 'name');

        res.status(201).json(populatedTask);
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
        const existingTask = await Task.findById(req.params.id);

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If team is being changed, update both old and new team's tasks arrays
        if (req.body.team && req.body.team !== existingTask.team?.toString()) {
            // Remove from old team
            if (existingTask.team) {
                await Team.findByIdAndUpdate(existingTask.team, {
                    $pull: { tasks: existingTask._id }
                });
            }
            // Add to new team
            await Team.findByIdAndUpdate(req.body.team, {
                $addToSet: { tasks: existingTask._id }
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignee', 'username email')
        .populate('team', 'name');

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

        // Remove task from team's tasks array
        if (deletedTask.team) {
            await Team.findByIdAndUpdate(deletedTask.team, {
                $pull: { tasks: deletedTask._id }
            });
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