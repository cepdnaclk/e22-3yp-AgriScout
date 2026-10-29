import React from 'react';

const MetricCard = ({ title, value, subtext, icon: Icon, trend, color = 'emerald' }) => {
  const colorGradients = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20'
  };

  const currentTheme = colorGradients[color] || colorGradients.emerald;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'rgba(52, 211, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} color="var(--emerald-400)" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? '#34d399' : '#f87171' }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
