import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../api';
import { io } from 'socket.io-client';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    let mounted = true;

    // Initial fetch of existing activity logs
    (async () => {
      try {
        const data = await apiFetch('/activity');
        if (mounted) setLogs(data);
      } catch (err) {
        console.error('Fetch logs failed:', err);
      }
    })();

    // Connect to Socket.IO for real-time updates
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001');

    socketRef.current.on('activity', act => {
      setLogs(prev => [act, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <h3>Activity Log</h3>
      <ul>
        {logs.map(l => (
          <li key={l._id}>
            {new Date(l.createdAt).toLocaleString()}: {l.action}
            {l.task?.title && ` ${l.task.title}`}
            {l.details && ` (${l.details})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
