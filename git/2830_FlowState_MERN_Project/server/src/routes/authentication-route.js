import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'A user with that email already exists'
            });
        }

        const newUser = await User.create({
            username: username || name,
            name,
            email,
            password
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
});

export default router;