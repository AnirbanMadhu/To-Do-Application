import React from 'react';
import SmartAssignButton from './SmartAssignButton';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  draggable,
  isEditing,
  editFields,
  setEditFields,
  onEditCancel,
  onEditSave,
  onSmartAssign,
  currentUser,
}) {
  // Editable fields UI
  if (isEditing) {
    return (
      <div className="task-card editing" draggable={false}>
        <input
          type="text"
          value={editFields.title}
          maxLength={40}
          onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))}
          autoFocus
        />
        <input
          type="text"
          value={editFields.description}
          onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))}
        />
        <select
          value={editFields.priority}
          onChange={e => setEditFields(f => ({ ...f, priority: e.target.value }))}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select
          value={editFields.status}
          onChange={e => setEditFields(f => ({ ...f, status: e.target.value }))}
        >
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <div className="card-actions">
          <button onClick={onEditSave}>Save</button>
          <button onClick={onEditCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  // Regular display
  const priority = task.priority ? task.priority.toLowerCase() : 'low';
  return (
    <div
      className={`task-card priority-${priority}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      tabIndex={0}
      style={{ animation: 'card-fadein 0.3s' }}
    >
      <div className="card-title">
        <span>{task.title}</span>
        {task.status !== 'Done' && (
          <SmartAssignButton onClick={onSmartAssign} />
        )}
      </div>
      <div className="card-desc">{task.description}</div>
      <div className="card-meta">
        <span>Priority: <b>{task.priority}</b></span>
        <span>Status: {task.status}</span>
        {task.assignedTo && task.assignedTo.username && (
          <span>Assigned: <b>{task.assignedTo.username}</b></span>
        )}
      </div>
      <div className="card-actions">
        <button onClick={onEdit}>Edit</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
