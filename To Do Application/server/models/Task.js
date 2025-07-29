const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  description:{ type: String },
  status:     { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority:   { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // creator
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt:  { type: Date, default: Date.now },
  version:    { type: Number, default: 1 }
}, { timestamps: true });

taskSchema.index({ title: 1, user: 1 }, { unique: true }); // Title unique per board

module.exports = mongoose.model('Task', taskSchema);
