import React from 'react';

const StatusBadge = ({ status = 'unknown', type = 'health' }) => {
  const norm = String(status).toLowerCase();

  let className = 'badge badge-unknown';
  let label = status;

  if (type === 'health') {
    if (norm === 'healthy') {
      className = 'badge badge-healthy';
      label = 'Healthy';
    } else if (norm === 'warning') {
      className = 'badge badge-warning';
      label = 'Warning';
    } else if (norm === 'critical') {
      className = 'badge badge-critical';
      label = 'Critical';
    } else {
      className = 'badge badge-unknown';
      label = 'Unknown';
    }
  } else if (type === 'robot') {
    if (norm === 'online' || norm === 'inspecting' || norm === 'idle') {
      className = 'badge badge-online';
      label = norm === 'inspecting' ? 'Inspecting' : norm === 'idle' ? 'Idle (Online)' : 'Online';
    } else if (norm === 'offline') {
      className = 'badge badge-offline';
      label = 'Offline';
    } else if (norm === 'error') {
      className = 'badge badge-critical';
      label = 'Error';
    }
  } else if (type === 'severity') {
    if (norm === 'critical') className = 'badge badge-critical';
    else if (norm === 'warning') className = 'badge badge-warning';
    else className = 'badge badge-healthy';
    label = norm.toUpperCase();
  }

  return (
    <span className={className}>
      <span className="pulse-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
