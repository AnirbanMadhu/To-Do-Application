import React from 'react';

export default function SmartAssignButton({ onClick }) {
  return (
    <button className="smart-assign-btn" title="Smart Assign" onClick={onClick}>
      🤖
    </button>
  );
}
