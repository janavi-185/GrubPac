import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Pending', 'All Content', 'Teachers', 'Analytics'];
const STATUS_COLOR = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-error' };

export default function PrincipalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Pending');

  // Pending
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectReason, setRejectReason] = useState({});
  const [reviewMsg, setReviewMsg] = useState({});

  // All content
  const [allContent, setAllContent] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [filters, setFilters] = useState({ subject: '', status: '', teacher_id: '' });
  const [allPage, setAllPage] = useState(1);
  const [allPagination, setAllPagination] = useState(null);

  // Teachers
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Analytics
  const [subjects, setSubjects] = useState([]);
  const [usage, setUsage] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const res = await api.get('/api/approval/pending?limit=20');
      setPending(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingPending(false); }
  };

  const fetchAllContent = async () => {
    setAllLoading(true);
    try {
      const params = new URLSearchParams({ page: allPage, limit: 8 });
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.status) params.append('status', filters.status);
      if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
      const res = await api.get(`/api/content?${params}`);
      setAllContent(res.data);
      setAllPagination(res.pagination);
    } catch (e) { console.error(e); }
    finally { setAllLoading(false); }
  };

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await api.get('/api/users/teachers?limit=50');
      setTeachers(res.data);
    } catch (e) { console.error(e); }
    finally { setTeachersLoading(false); }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [s, u] = await Promise.all([
        api.get('/api/analytics/subjects'),
        api.get('/api/analytics/content-usage?limit=10&status=APPROVED'),
      ]);
      setSubjects(s.data);
      setUsage(u.data);
    } catch (e) { console.error(e); }
    finally { setAnalyticsLoading(false); }
  };

  useEffect(() => {
    if (tab === 'Pending') fetchPending();
    if (tab === 'All Content') fetchAllContent();
    if (tab === 'Teachers') fetchTeachers();
    if (tab === 'Analytics') fetchAnalytics();
  }, [tab]);

  useEffect(() => { if (tab === 'All Content') fetchAllContent(); }, [allPage, filters]);

  const review = async (id, action) => {
    try {
      const body = { action };
      if (action === 'reject') {
        if (!rejectReason[id]) { setReviewMsg(m => ({ ...m, [id]: 'Please enter a rejection reason' })); return; }
        body.rejection_reason = rejectReason[id];
      }
      await api.patch(`/api/approval/${id}/review`, body);
      setReviewMsg(m => ({ ...m, [id]: action === 'approve' ? '✅ Approved' : '❌ Rejected' }));
      setTimeout(fetchPending, 800);
    } catch (err) {
      setReviewMsg(m => ({ ...m, [id]: err.message }));
    }
  };

  const deleteContent = async id => {
    if (!confirm('Delete this content?')) return;
    try { await api.delete(`/api/content/${id}`); fetchAllContent(); }
    catch (err) { alert(err.message); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const TAB_ICONS = { Pending: '⏳', 'All Content': '📋', Teachers: '👥', Analytics: '📊' };

  const maxViews = subjects.length > 0 ? Math.max(...subjects.map(s => Number(s.total_views))) : 1;

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">⚡ Syncro</div>
        <div className="sidebar-user">
          <div className="sidebar-avatar principal">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sidebar-name">{user?.name}</div>
            <div className="sidebar-role">Principal</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t} className={`sidebar-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {TAB_ICONS[t]} {t}
              {t === 'Pending' && pending.length > 0 && (
                <span className="sidebar-count">{pending.length}</span>
              )}
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
            <p className="dash-sub">{
              tab === 'Pending' ? 'Review and approve or reject submitted content' :
              tab === 'All Content' ? 'Browse all content across all teachers' :
              tab === 'Teachers' ? 'All registered teachers' :
              'Subject-wise analytics and content usage'
            }</p>
          </div>
        </div>

        {/* ── PENDING TAB ── */}
        {tab === 'Pending' && (
          <div>
            {loadingPending ? <div className="loading-state">Loading…</div> :
              pending.length === 0 ? <div className="empty-state">🎉 No pending content — all reviewed!</div> : (
                <div className="approval-list">
                  {pending.map(item => (
                    <div key={item.id} className="approval-card">
                      <div className="approval-card-top">
                        <div>
                          <div className="approval-title">{item.title}</div>
                          <div className="approval-meta">
                            <span className="tag">📚 {item.subject}</span>
                            <span className="tag">👩‍🏫 {item.uploader?.name || 'Unknown'}</span>
                            <span className="tag">📅 {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          {item.description && <p className="approval-desc">{item.description}</p>}
                        </div>
                        <div className="approval-actions">
                          <button className="btn btn-success" onClick={() => review(item.id, 'approve')}>✅ Approve</button>
                        </div>
                      </div>
                      <div className="reject-row">
                        <input
                          placeholder="Rejection reason (required to reject)"
                          value={rejectReason[item.id] || ''}
                          onChange={e => setRejectReason(r => ({ ...r, [item.id]: e.target.value }))}
                          className="reject-input"
                        />
                        <button className="btn btn-danger" onClick={() => review(item.id, 'reject')}>❌ Reject</button>
                      </div>
                      {reviewMsg[item.id] && <div className="review-msg">{reviewMsg[item.id]}</div>}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── ALL CONTENT TAB ── */}
        {tab === 'All Content' && (
          <div>
            <div className="filter-bar">
              <input placeholder="Subject…" value={filters.subject} className="filter-input"
                onChange={e => { setFilters(f => ({ ...f, subject: e.target.value })); setAllPage(1); }} />
              <select className="filter-select" value={filters.status}
                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setAllPage(1); }}>
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            {allLoading ? <div className="loading-state">Loading…</div> : (
              <>
                {allContent.length === 0 ? <div className="empty-state">No content found.</div> : (
                  <div className="content-table">
                    <div className="table-head">
                      <span>Title</span><span>Subject</span><span>Teacher</span><span>Status</span><span>Date</span><span></span>
                    </div>
                    {allContent.map(item => (
                      <div key={item.id} className="table-row">
                        <span className="table-title">{item.title}</span>
                        <span><span className="tag">📚 {item.subject}</span></span>
                        <span>{item.uploader?.name || '—'}</span>
                        <span><span className={`badge ${STATUS_COLOR[item.status]}`}>{item.status}</span></span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        <span>
                          <button className="icon-btn danger" onClick={() => deleteContent(item.id)}>🗑️</button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {allPagination && allPagination.totalPages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-outline" disabled={allPage === 1} onClick={() => setAllPage(p => p - 1)}>← Prev</button>
                    <span className="page-info">Page {allPagination.currentPage} of {allPagination.totalPages}</span>
                    <button className="btn btn-outline" disabled={!allPagination.hasNextPage} onClick={() => setAllPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TEACHERS TAB ── */}
        {tab === 'Teachers' && (
          <div>
            {teachersLoading ? <div className="loading-state">Loading…</div> : (
              <div className="teachers-grid">
                {teachers.map(t => (
                  <div key={t.id} className="teacher-card">
                    <div className="teacher-avatar">{t.name?.[0]?.toUpperCase()}</div>
                    <div className="teacher-name">{t.name}</div>
                    <div className="teacher-email">{t.email}</div>
                    <div className="tag" style={{ marginTop: '0.5rem' }}>ID: {t.id.slice(0, 8)}…</div>
                  </div>
                ))}
                {teachers.length === 0 && <div className="empty-state">No teachers registered yet.</div>}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'Analytics' && (
          <div>
            {analyticsLoading ? <div className="loading-state">Loading analytics…</div> : (
              <>
                <h2 className="section-heading">📊 Subject Activity</h2>
                <div className="analytics-list">
                  {subjects.length === 0 ? <div className="empty-state">No view data yet — hit the broadcast endpoint to generate views.</div> :
                    subjects.map((s, i) => (
                      <div key={s.subject} className="analytics-row">
                        <div className="analytics-rank">#{i + 1}</div>
                        <div className="analytics-info">
                          <div className="analytics-subject">{s.subject}</div>
                          <div className="analytics-bar-wrap">
                            <div className="analytics-bar" style={{ width: `${Math.round((Number(s.total_views) / maxViews) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="analytics-stats">
                          <span className="stat-chip">{s.total_views} views</span>
                          <span className="stat-chip">{s.total_approved_content} approved</span>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <h2 className="section-heading" style={{ marginTop: '2rem' }}>🔥 Most Viewed Content</h2>
                <div className="content-table">
                  <div className="table-head">
                    <span>Title</span><span>Subject</span><span>Teacher</span><span>Status</span><span>Views</span>
                  </div>
                  {usage.map(item => (
                    <div key={item.id} className="table-row">
                      <span className="table-title">{item.title}</span>
                      <span><span className="tag">📚 {item.subject}</span></span>
                      <span>{item.teacher_name || '—'}</span>
                      <span><span className={`badge ${STATUS_COLOR[item.status]}`}>{item.status}</span></span>
                      <span><strong>{item.view_count}</strong></span>
                    </div>
                  ))}
                  {usage.length === 0 && <div className="empty-state">No usage data yet.</div>}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
