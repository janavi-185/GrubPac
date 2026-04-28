import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'PRINCIPAL' ? '/principal' : '/teacher');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">⚡ Syncro</Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label>Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@school.com"
              value={form.email}
              onChange={handle}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              required
            />
          </div>
          <button id="login-submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
