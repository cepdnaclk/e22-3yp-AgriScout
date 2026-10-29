import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Leaf, Wifi, WifiOff, Bell, BatteryCharging, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ activeAlertCount = 0 }) => {
  const { user, logout } = useAuth();
  const { connected, lastRobotStatus } = useSocket();

  const battery = lastRobotStatus?.batteryLevel ?? 92;
  const isRobotOnline = lastRobotStatus?.connectionStatus === 'online' || lastRobotStatus?.connectionStatus === 'inspecting';

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(11, 18, 14, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Leaf size={20} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            FloraBot <span style={{ color: 'var(--emerald-400)', fontWeight: 500, fontSize: '0.85rem' }}>IoT</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Greenhouse Telemetry & Vision
          </span>
        </div>
      </div>

      {/* Telemetry quick indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Socket.IO status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: connected ? '#34d399' : '#f87171'
          }}
          title={connected ? 'Real-time WebSocket connected' : 'WebSocket disconnected'}
        >
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connected ? 'LIVE TELEMETRY' : 'OFFLINE'}</span>
        </div>

        {/* Robot quick battery badge */}
        <Link
          to="/robots"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            color: isRobotOnline ? '#34d399' : '#94a3b8',
            textDecoration: 'none'
          }}
          title="Robot Battery & Status"
        >
          <BatteryCharging size={14} />
          <span>ROBOT: {battery}%</span>
        </Link>

        {/* Alerts count */}
        <Link
          to="/alerts"
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            color: activeAlertCount > 0 ? '#fbbf24' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
          title="View active alerts"
        >
          <Bell size={18} />
          {activeAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}
            >
              {activeAlertCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(52, 211, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-400)'
            }}
          >
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#ffffff' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
              {user?.role || 'Viewer'}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '0.5rem', padding: '0.35rem 0.5rem' }}
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
