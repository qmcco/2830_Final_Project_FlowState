import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

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

        // Add task to project's tasks array
        if (project) {
            await Project.findByIdAndUpdate(project, {
                $addToSet: { tasks: newTask._id }
            });
        }

        const populatedTask = await Task.findById(newTask._id)
            .populate('assignee', 'username email')
            .populate('project', 'name');

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

        // If project is being changed, update both old and new project's tasks arrays
        if (req.body.project && req.body.project !== existingTask.project?.toString()) {
            // Remove from old project
            if (existingTask.project) {
                await Project.findByIdAndUpdate(existingTask.project, {
                    $pull: { tasks: existingTask._id }
                });
            }
            // Add to new project
            await Project.findByIdAndUpdate(req.body.project, {
                $addToSet: { tasks: existingTask._id }
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignee', 'username email')
        .populate('project', 'name');

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

        // Remove task from project's tasks array
        if (deletedTask.project) {
            await Project.findByIdAndUpdate(deletedTask.project, {
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