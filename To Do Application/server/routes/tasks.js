// File: backend/routes/tasks.js

const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const verifyToken = require('../middleware/verifyToken');
const checkTaskConflict = require('../middleware/conflict');

/**
 * Create task routes with real-time updates via Socket.IO
 * @param {import('socket.io').Server} io 
 */
const makeTaskRoutes = (io) => {
  const router = express.Router();

  // ─── GET ALL TASKS (user's board) ──────────────
  router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    try {
      const tasks = await Task.find({ user: userId })
        .populate('assignedTo', 'username email')
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── CREATE TASK ───────────────────────────────
  router.post('/', verifyToken, async (req, res) => {
    const { title, description, priority = 'Low', status = 'Todo', deadline, assignedTo } = req.body;
    const userId = req.user.userId;

    if (!title) return res.status(400).json({ error: 'Title required' });

    // Enforce unique title per user board
    const exists = await Task.findOne({ user: userId, title });
    if (exists) return res.status(400).json({ error: 'Task title must be unique per board' });

    const data = { title, description, priority, status, user: userId };
    if (deadline) data.deadline = new Date(deadline);
    if (assignedTo) data.assignedTo = assignedTo;

    try {
      const task = new Task(data);
      await task.save();

      // Populate fields for response
      await task.populate('user', 'username email');
      await task.populate('assignedTo', 'username email');

      // Log activity
      await Activity.create({ user: userId, action: 'created', task: task._id });

      // Emit real-time update
      io.emit('tasks:update', { type: 'created', task });

      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── UPDATE TASK (with conflict check) ────────
  router.put('/:id', verifyToken, checkTaskConflict, async (req, res) => {
    const { title, description, status, priority, assignedTo, deadline } = req.body;
    const userId = req.user.userId;
    let task = req.task;

    // Title uniqueness check
    if (title && title !== task.title) {
      const exists = await Task.findOne({ user: task.user, title });
      if (exists) return res.status(400).json({ error: 'Task title must be unique per board' });
    }

    // Update fields
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.assignedTo = assignedTo ?? task.assignedTo;
    if (deadline) task.deadline = new Date(deadline);
    task.version += 1;
    task.updatedAt = new Date();

    try {
      await task.save();

      // Log activity
      await Activity.create({ user: userId, action: 'updated', task: task._id });

      io.emit('tasks:update', { type: 'updated', task });
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── DELETE TASK ───────────────────────────────
  router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      const task = await Task.findByIdAndDelete(id);
      if (task) {
        await Activity.create({ user: userId, action: 'deleted', task: id });
        io.emit('tasks:update', { type: 'deleted', taskId: id });
        return res.json({ ok: true });
      }
      res.status(404).json({ error: 'Task not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── SMART ASSIGN ──────────────────────────────
  router.post('/:id/smart-assign', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      // Find user with fewest active (not Done) tasks
      const users = await User.find({});
      let min = Infinity, best = null;
      for (const u of users) {
        const count = await Task.countDocuments({ assignedTo: u._id, status: { $ne: 'Done' } });
        if (count < min) { min = count; best = u; }
      }
      task.assignedTo = best._id;
      task.version += 1;
      await task.save();

      await Activity.create({ user: req.user.userId, action: 'smart assigned', task: task._id });
      io.emit('tasks:update', { type: 'updated', task });
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── DRAG & DROP MOVE (status/assignee) ───────
  router.put('/:id/move', verifyToken, checkTaskConflict, async (req, res) => {
    const { status, assignedTo } = req.body;
    let task = req.task;
    task.status = status ?? task.status;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.version += 1;
    task.updatedAt = new Date();
    try {
      await task.save();
      await Activity.create({ user: req.user.userId, action: 'moved', task: task._id });
      io.emit('tasks:update', { type: 'updated', task });
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = makeTaskRoutes;
