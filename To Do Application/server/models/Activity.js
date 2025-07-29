// backend/models/Activity.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true },
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: false },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
