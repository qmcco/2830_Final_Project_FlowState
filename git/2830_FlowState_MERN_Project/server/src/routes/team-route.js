import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';

const router = express.Router();

// GET all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'username email');

        res.json(teams);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching teams',
            error: error.message
        });
    }
});

// GET team by id
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('members', 'username email');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json(team);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching team',
            error: error.message
        });
    }
});

// CREATE team
router.post('/', async (req, res) => {
    try {
        const { name, description, members } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const newTeam = await Team.create({ name, description, members });

        // Add team to each member's teams array
        if (members && members.length > 0) {
            await User.updateMany(
                { _id: { $in: members } },
                { $addToSet: { teams: newTeam._id } }
            );
        }

        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating team',
            error: error.message
        });
    }
});

// UPDATE team
router.put('/:id', async (req, res) => {
    try {
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('members', 'username email');

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating team',
            error: error.message
        });
    }
});

// DELETE team
router.delete('/:id', async (req, res) => {
    try {
        const deletedTeam = await Team.findByIdAndDelete(req.params.id);

        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Remove team from all members' teams array
        await User.updateMany(
            { teams: req.params.id },
            { $pull: { teams: req.params.id } }
        );

        res.json({
            message: 'Team deleted successfully',
            team: deletedTeam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting team',
            error: error.message
        });
    }
});

// ADD member to team
router.post('/:id/members', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('members', 'username email');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Also add team to user's teams array
        await User.findByIdAndUpdate(userId, {
            $addToSet: { teams: req.params.id }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({
            message: 'Error adding member to team',
            error: error.message
        });
    }
});

// REMOVE member from team
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { $pull: { members: req.params.userId } },
            { new: true }
        ).populate('members', 'username email');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Also remove team from user's teams array
        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { teams: req.params.id }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({
            message: 'Error removing member from team',
            error: error.message
        });
    }
});

export default router;