const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new task
router.post('/', [
    auth,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, dueDate, priority, assignedTo } = req.body;

        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            assignedTo,
            createdBy: req.user.id
        });

        await task.save();

        // Create notifications for assigned users
        if (assignedTo && assignedTo.length > 0) {
            const notifications = assignedTo.map(userId => ({
                user: userId,
                task: task._id,
                type: 'assignment',
                message: `You have been assigned to task: ${title}`
            }));

            await Notification.insertMany(notifications);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a task
router.put('/:id', [
    auth,
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is authorized to update the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            task[key] = updates[key];
        });

        await task.save();

        // Create notification for status change
        if (updates.status) {
            const notification = new Notification({
                user: req.user.id,
                task: task._id,
                type: 'status-change',
                message: `Task "${task.title}" status changed to ${updates.status}`
            });
            await notification.save();
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is authorized to delete the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a comment to a task
router.post('/:id/comments', [
    auth,
    body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = {
            user: req.user.id,
            text: req.body.text
        };

        task.comments.push(comment);
        await task.save();

        // Create notification for task creator
        if (task.createdBy.toString() !== req.user.id) {
            const notification = new Notification({
                user: task.createdBy,
                task: task._id,
                type: 'comment',
                message: `New comment on task "${task.title}"`
            });
            await notification.save();
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 