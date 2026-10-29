import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to connect to backend server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          backgroundColor: 'rgba(15, 23, 19, 0.85)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Leaf size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>FloraBot System</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automated Greenhouse Robot Telemetry & Diagnostics
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@greenhouse.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.65rem', textAlign: 'center' }}>
            Quick Demo Login Accounts:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@greenhouse.local', 'AdminPass123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('operator@greenhouse.local', 'OperatorPass123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem' }}
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('viewer@greenhouse.local', 'ViewerPass123!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.725rem' }}
            >
              Viewer
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#10b981',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
