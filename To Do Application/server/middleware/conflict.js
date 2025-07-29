const Task = require('../models/Task');

// Middleware to check for task update conflicts (using version, fallback to updatedAt)
async function checkTaskConflict(req, res, next) {
  const taskId = req.params.id;
  const clientVersion = req.body.version;
  const clientUpdatedAt = req.body.updatedAt;

  try {
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Conflict check: Prefer version, fallback to updatedAt
    if (clientVersion !== undefined) {
      if (existingTask.version !== clientVersion) {
        return res.status(409).json({
          error: 'Conflict detected. Task was modified by another user.',
          latestTask: existingTask
        });
      }
    } else if (clientUpdatedAt &&
      new Date(clientUpdatedAt).getTime() !== new Date(existingTask.updatedAt).getTime()
    ) {
      return res.status(409).json({
        error: 'Conflict detected. Task was modified by another user.',
        latestTask: existingTask
      });
    }

    // No conflict, proceed
    req.task = existingTask;
    next();
  } catch (err) {
    console.error('Conflict middleware error:', err);
    res.status(500).json({ error: 'Server error during conflict check' });
  }
}

module.exports = checkTaskConflict;
