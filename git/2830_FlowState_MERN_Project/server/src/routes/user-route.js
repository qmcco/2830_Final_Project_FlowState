import express from 'express';
import User from '../models/User.js';
import Team from '../models/Team.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('teams', 'name description members');

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// GET user by id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('teams', 'name description members');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// UPDATE user
router.put('/:id', async (req, res) => {
    try {
        // Prevent password updates through this route
        const { password, ...updateData } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating user',
            error: error.message
        });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove user from all teams they belong to
        await Team.updateMany(
            { members: req.params.id },
            { $pull: { members: req.params.id } }
        );

        res.json({
            message: 'User deleted successfully',
            user: {
                _id: deletedUser._id,
                username: deletedUser.username,
                email: deletedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// GET all teams for a user
router.get('/:id/teams', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('teams', 'name description members');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.teams);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user teams',
            error: error.message
        });
    }
});

export default router;