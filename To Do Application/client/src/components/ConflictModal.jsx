import React from 'react';

export default function ConflictModal({ conflict, onResolve, onCancel }) {
  const { server, client } = conflict;
  return (
    <div className="conflict-modal">
      <div className="conflict-box">
        <h3>Task Conflict Detected</h3>
        <p>
          Someone else edited this task while you were editing.<br />
          <b>Choose which version to keep:</b>
        </p>
        <div className="conflict-columns">
          <div>
            <h4>Your version</h4>
            <pre>
              {client ? JSON.stringify(client, null, 2) : <i>(empty)</i>}
            </pre>
            <button onClick={() => onResolve('client')}>Keep Mine</button>
          </div>
          <div>
            <h4>Server version</h4>
            <pre>
              {server ? JSON.stringify(server, null, 2) : <i>(empty)</i>}
            </pre>
            <button onClick={() => onResolve('server')}>Keep Server</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="close" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
