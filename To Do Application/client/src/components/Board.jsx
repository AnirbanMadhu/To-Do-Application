// src/components/Board.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../api';
import ActivityLog from './ActivityLog';
import TaskCard from './TaskCard';
import ConflictModal from './ConflictModal';
import { io } from 'socket.io-client';
import videoBG from './assest/videoBG.mp4';
import './Board.css';

const STATUSES = ['Todo', 'In Progress', 'Done'];
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4001';

export default function Board() {
  const { user, token, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Low', status: 'Todo' });
  const [draggedTask, setDraggedTask] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [error, setError] = useState('');
  const [showActivity, setShowActivity] = useState(false);

  const socketRef = useRef(null);
  const videoRef = useRef(null);

  // Initialize background video playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  // Setup real-time socket.io listeners
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('tasks:update', ({ type, task, taskId }) => {
      setTasks(prev => {
        if (type === 'created') return [task, ...prev];
        if (type === 'deleted') return prev.filter(t => t._id !== taskId);
        if (type === 'updated') return prev.map(t => (t._id === task._id ? task : t));
        return prev;
      });
    });

    socket.on('activity', act => {
      setActivities(prev => [act, ...prev.slice(0, 19)]);
    });

    return () => socket.disconnect();
  }, []);

  // Initial fetch of tasks and activity log
  useEffect(() => {
    async function fetchAll() {
      try {
        const [ts, acts] = await Promise.all([
          apiFetch('/tasks', 'GET', null, token),
          apiFetch('/activity', 'GET', null, token),
        ]);
        setTasks(ts);
        setActivities(acts);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchAll();
  }, [token]);

  // Create new task
  async function handleCreateTask(e) {
    e.preventDefault();
    setError('');
    if (!newTask.title.trim()) {
      return setError('Title required');
    }
    if (tasks.some(t => t.title === newTask.title)) {
      return setError('Title must be unique per board');
    }
    try {
      await apiFetch('/tasks', 'POST', newTask, token);
      setNewTask({ title: '', description: '', priority: 'Low', status: 'Todo' });
    } catch (e) {
      setError(e.message);
    }
  }

  // Start editing a task
  function startEdit(task) {
    setEditingId(task._id);
    setEditFields({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || null,
    });
  }

  // Cancel edit
  function cancelEdit() {
    setEditingId(null);
    setEditFields({});
  }

  // Save edited task
  async function saveEdit(task) {
    setError('');
    try {
      const payload = { ...editFields, version: task.version };
      if (!payload.assignedTo) delete payload.assignedTo;
      await apiFetch(`/tasks/${task._id}`, 'PUT', payload, token);
      setEditingId(null);
      setEditFields({});
    } catch (e) {
      if (e.message.includes('Conflict')) {
        setConflictData({
          server: e.latestTask || {},
          client: { ...task, ...editFields },
          id: task._id,
        });
      } else {
        setError(e.message);
      }
    }
  }

  // Delete task
  async function handleDelete(id) {
    setError('');
    try {
      await apiFetch(`/tasks/${id}`, 'DELETE', null, token);
    } catch (e) {
      setError(e.message);
    }
  }

  // Drag & drop handlers
  function onDragStart(task) {
    setDraggedTask(task);
  }
  function onDragEnd() {
    setDraggedTask(null);
  }
  async function onDrop(status) {
    if (!draggedTask) return;
    try {
      await apiFetch(
        `/tasks/${draggedTask._id}/move`,
        'PUT',
        { status, version: draggedTask.version },
        token
      );
    } catch (e) {
      if (e.message.includes('Conflict')) {
        setConflictData({
          server: e.latestTask || {},
          client: { ...draggedTask, status },
          id: draggedTask._id,
        });
      } else {
        setError(e.message);
      }
    }
    setDraggedTask(null);
  }

  // Smart assign a task
  async function handleSmartAssign(taskId) {
    setError('');
    try {
      await apiFetch(`/tasks/${taskId}/smart-assign`, 'POST', {}, token);
    } catch (e) {
      setError(e.message);
    }
  }

  // Resolve a conflict by choosing server or client version
  async function resolveConflict(keep) {
    const { server, client, id } = conflictData;
    try {
      await apiFetch(
        `/tasks/${id}`,
        'PUT',
        {
          ...(keep === 'server' ? server : client),
          version: keep === 'server' ? server.version : client.version,
        },
        token
      );
      setConflictData(null);
    } catch (e) {
      setError(e.message);
      setConflictData(null);
    }
  }

  return (
    <div className="board-container">
      {/* Fullscreen blurred background video */}
      <video
        ref={videoRef}
        src={videoBG}
        autoPlay
        loop
        muted
        className="background_video"
      />
      <div className="background_Box" />

      {/* Main Kanban UI */}
      
      <div className="kanban-app">
        <header>
          <h1>Todo Board</h1>
          <button onClick={logout}>Logout</button>
          <button onClick={() => setShowActivity(s => !s)}>
            {showActivity ? 'Hide' : 'Show'} Activity Log
          </button>
        </header>
        {error && <div className="error-bar">{error}</div>}

        <form className="task-create-form" onSubmit={handleCreateTask}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            maxLength={40}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button type="submit">Add</button>
        </form>

        <div className="kanban-board">
          {STATUSES.map(status => (
            <div
              key={status}
              className={`kanban-column col-${status.toLowerCase().replace(' ', '-')}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(status)}
            >
              <h2>{status}</h2>
              {tasks
                .filter(t => t.status === status)
                .map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => startEdit(task)}
                    onDelete={() => handleDelete(task._id)}
                    onDragStart={() => onDragStart(task)}
                    onDragEnd={onDragEnd}
                    draggable
                    isEditing={editingId === task._id}
                    editFields={editFields}
                    setEditFields={setEditFields}
                    onEditCancel={cancelEdit}
                    onEditSave={() => saveEdit(task)}
                    onSmartAssign={() => handleSmartAssign(task._id)}
                    currentUser={user}
                  />
                ))}
            </div>
          ))}
        </div>

        {showActivity && <ActivityLog activities={activities} />}
        {conflictData && (
          <ConflictModal
            conflict={conflictData}
            onResolve={resolveConflict}
            onCancel={() => setConflictData(null)}
          />
        )}
      </div>
    </div>
  );
}
