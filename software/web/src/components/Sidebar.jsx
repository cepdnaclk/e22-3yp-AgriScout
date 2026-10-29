import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Sprout,
  ClipboardList,
  ScanEye,
  Activity,
  AlertTriangle,
  Bot,
  Camera,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Greenhouses', path: '/greenhouses', icon: Home },
  { name: 'Plant Directory', path: '/plants', icon: Sprout },
  { name: 'Inspections', path: '/inspections', icon: ClipboardList },
  { name: 'AI Disease Detection', path: '/diseases', icon: ScanEye },
  { name: 'NPK Soil Analytics', path: '/npk-analytics', icon: Activity },
  { name: 'System Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Robot Monitoring', path: '/robots', icon: Bot },
  { name: 'Camera Preview', path: '/camera', icon: Camera },
  { name: 'Settings & Config', path: '/settings', icon: Settings }
];

const Sidebar = () => {
  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'rgba(13, 20, 16, 0.95)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.75rem',
        gap: '0.35rem',
        minHeight: 'calc(100vh - 64px)'
      }}
    >
      <div style={{ padding: '0.25rem 0.75rem 0.75rem', fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent'
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  color={isActive ? 'var(--emerald-400)' : 'var(--text-dim)'}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '1rem 0.75rem 0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          <div>RPi 5 + Modbus NPK + AI</div>
          <div style={{ color: 'var(--emerald-500)', fontWeight: 500, marginTop: '2px' }}>v1.0.0 Production</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
