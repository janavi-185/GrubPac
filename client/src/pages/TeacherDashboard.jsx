import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_BASE_URL;

const TABS = ['Upload', 'My Content'];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Upload');

  // Upload form
  const [form, setForm] = useState({ title: '', subject: '', description: '', start_time: '', end_time: '', rotation_duration: 5 });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  // My content
  const [content, setContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchMyContent = async () => {
    setLoadingContent(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (subjectFilter) params.append('subject', subjectFilter);
      const res = await api.get(`/api/content/my?${params}`);
      setContent(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => { if (tab === 'My Content') fetchMyContent(); }, [tab, page, subjectFilter]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return setUploadMsg({ type: 'error', text: 'Please select a file' });
    setUploading(true); setUploadMsg(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', file);
      await api.post('/api/content/upload', fd);
      setUploadMsg({ type: 'success', text: 'Content uploaded successfully — pending principal approval' });
      setForm({ title: '', subject: '', description: '', start_time: '', end_time: '', rotation_duration: 5 });
      setFile(null);
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this content?')) return;
    try {
      await api.delete(`/api/content/${id}`);
      fetchMyContent();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const STATUS_COLOR = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-error' };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">⚡ Syncro</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sidebar-name">{user?.name}</div>
            <div className="sidebar-role">Teacher</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t} className={`sidebar-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'Upload' ? '📤' : '📋'} {t}
            </button>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>↩ Sign out</button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">{tab}</h1>
            <p className="dash-sub">{tab === 'Upload' ? 'Upload new content for approval' : 'Manage your uploaded content'}</p>
          </div>
        </div>

        {/* ── UPLOAD TAB ── */}
        {tab === 'Upload' && (
          <div className="card">
            {uploadMsg && (
              <div className={`alert alert-${uploadMsg.type}`}>{uploadMsg.text}</div>
            )}
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input placeholder="e.g. Algebra Chapter 3" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input placeholder="e.g. maths, science" value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} placeholder="Optional description" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="datetime-local" value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input type="datetime-local" value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Rotation (min)</label>
                  <input type="number" min={1} max={60} value={form.rotation_duration}
                    onChange={e => setForm(f => ({ ...f, rotation_duration: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>File * &nbsp;<span className="text-muted">(PDF, TXT, DOCX, images — max 10MB)</span></label>
                <input type="file" onChange={e => setFile(e.target.files[0])} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? 'Uploading…' : '📤 Upload Content'}
              </button>
            </form>
          </div>
        )}

        {/* ── MY CONTENT TAB ── */}
        {tab === 'My Content' && (
          <div>
            <div className="filter-bar">
              <input placeholder="Filter by subject…" value={subjectFilter}
                onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
                className="filter-input" />
            </div>

            {loadingContent ? <div className="loading-state">Loading…</div> : (
              <>
                {content.length === 0 ? (
                  <div className="empty-state">No content found. Upload something first!</div>
                ) : (
                  <div className="content-grid">
                    {content.map(item => (
                      <div key={item.id} className="content-card">
                        <div className="content-card-header">
                          <span className={`badge ${STATUS_COLOR[item.status]}`}>{item.status}</span>
                          <button className="icon-btn danger" onClick={() => handleDelete(item.id)}>🗑️</button>
                        </div>
                        <div className="content-card-title">{item.title}</div>
                        <div className="content-card-meta">
                          <span className="tag">📚 {item.subject}</span>
                          {item.file_url && (
                            <a href={`${BASE}/${item.file_url}`} target="_blank" rel="noreferrer" className="tag tag-link">📎 View file</a>
                          )}
                        </div>
                        {item.rejection_reason && (
                          <div className="alert alert-error small">Reason: {item.rejection_reason}</div>
                        )}
                        <div className="content-card-date">{new Date(item.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span className="page-info">Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button className="btn btn-outline" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
