import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('team', 'name')
            .populate('tasks', 'title status priority dueDate');

        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching projects',
            error: error.message
        });
    }
});

// GET
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('team', 'name')
            .populate('tasks', 'title status priority dueDate');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching project',
            error: error.message
        });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const { name, startDate, endDate, team, tasks } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const newProject = await Project.create({
            name,
            startDate,
            endDate,
            team,
            tasks
        });

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating project',
            error: error.message
        });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating project',
            error: error.message
        });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({
            message: 'Project deleted successfully',
            project: deletedProject
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting project',
            error: error.message
        });
    }
});

// GET all tasks from projcet
router.get('/:id/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.id })
            .populate('assignee', 'username email');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching project tasks',
            error: error.message
        });
    }
});

export default router;