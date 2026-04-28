import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TEACHER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      // Auto-login after register
      const res = await api.post('/api/auth/login', { email: form.email, password: form.password });
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join your school on Syncro</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label>Full name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handle}
              required
            />
          </div>
          <div className="form-group">
            <label>School email address</label>
            <input
              id="reg-email"
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
              id="reg-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select id="reg-role" name="role" value={form.role} onChange={handle}>
              <option value="TEACHER">Teacher</option>
              <option value="PRINCIPAL">Principal</option>
            </select>
          </div>
          <button id="reg-submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
