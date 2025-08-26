import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG, USER_ROLES } from '../constants';
import './UserManagement.css';

const TaskManagement = () => {
  const { user, isAdmin, isStaff, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: '',
    assigneeId: '',
    projectId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const fileRef = useState(null);

  const resetForm = () => {
    setIsEditing(false);
    setForm({ id: null, title: '', description: '', status: 'pending', priority: 'medium', deadline: '', assigneeId: '', projectId: '' });
  };

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token || localStorage.getItem('token') || ''}` } });

  const fetchUsersForTasks = async () => {
    try {
      if (isAdmin) {
        const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/users`, authHeaders());
        setUsers(res.data || []);
      } else if (isStaff && user?.id) {
        const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/users/${user.id}`, authHeaders());
        setUsers(res.data ? [res.data] : []);
      }
    } catch (e) {
      console.error('Fetch users for tasks failed:', e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/projects`, authHeaders());
      setProjects(res.data || []);
    } catch (e) {
      console.error('Fetch projects failed:', e);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/tasks`, authHeaders());
      setTasks(res.data || []);
    } catch (e) {
      console.error('Fetch tasks failed:', e);
      setError('Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (token || localStorage.getItem('token'))) {
      fetchTasks();
      fetchUsersForTasks();
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, isAdmin, isStaff, user?.id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority || 'medium',
        deadline: form.deadline || null,
        assigneeId: isAdmin ? form.assigneeId : user.id,
        projectId: form.projectId || null,
      };
      const res = await axios.post(`${API_CONFIG.LOCAL_API_URL}/tasks`, payload, authHeaders());
      setTasks(prev => [res.data, ...prev]);
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Tạo công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (task) => {
    setIsEditing(true);
    setForm({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      deadline: task.deadline ? task.deadline.substring(0, 10) : '',
      assigneeId: task.assigneeId || '',
      projectId: task.projectId || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority || 'medium',
        deadline: form.deadline || null,
        assigneeId: isAdmin ? form.assigneeId : undefined,
        projectId: form.projectId || null,
      };
      const res = await axios.put(`${API_CONFIG.LOCAL_API_URL}/tasks/${form.id}`, payload, authHeaders());
      setTasks(prev => prev.map(t => t.id === form.id ? res.data : t));
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Cập nhật công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Xóa công việc này?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_CONFIG.LOCAL_API_URL}/tasks/${taskId}`, authHeaders());
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      setError(e?.response?.data?.message || 'Xóa công việc thất bại');
    } finally {
      setLoading(false);
    }
  };

  const visibleUsers = useMemo(() => users, [users]);

  return (
    <div className="user-management-container">
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Task Management</h1>
            <p>{isAdmin ? 'Admin có thể quản lý mọi task' : 'Bạn chỉ có thể quản lý task của mình'}</p>
          </div>
          <div className="header-actions">
            <button onClick={() => fetchTasks()} className="back-button" disabled={loading}>↻ Refresh</button>
            <button onClick={() => navigate('/dashboard')} className="back-button">← Dashboard</button>
          </div>
        </div>
      </header>

      {error && (
        <div className="message error">{error}</div>
      )}

      <main className="user-management-main">
        <div className="users-table-container">
          <div className="table-header">
            <h2>{isEditing ? 'Cập nhật công việc' : 'Tạo công việc mới'}</h2>
          </div>
          <form onSubmit={isEditing ? handleUpdate : handleCreate} className="table-controls">
            <div className="control">
              <label>Title</label>
              <input name="title" value={form.title} onChange={onChange} required />
            </div>
            <div className="control">
              <label>Description</label>
              <input name="description" value={form.description} onChange={onChange} />
            </div>
            <div className="control">
              <label>Deadline</label>
              <input type="date" name="deadline" value={form.deadline || ''} onChange={onChange} />
            </div>
            <div className="control">
              <label>Priority</label>
              <select name="priority" value={form.priority || 'medium'} onChange={onChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="control">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="control">
              <label>Assignee</label>
              <select name="assigneeId" value={form.assigneeId} onChange={onChange} disabled={isStaff} required>
                <option value="">-- Chọn --</option>
                {visibleUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                ))}
              </select>
            </div>
            <div className="control">
              <label>Project</label>
              <select name="projectId" value={form.projectId} onChange={onChange}>
                <option value="">-- Không --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="control">
              <label>&nbsp;</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="create-user-button" disabled={loading}>
                  {isEditing ? 'Cập nhật' : 'Tạo mới'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="cancel-button">Hủy</button>
                )}
              </div>
            </div>
          </form>

          <div className="table-header" style={{ marginTop: 16 }}>
            <h2>Danh sách công việc ({tasks.length})</h2>
          </div>
          <div className="table-controls">
            <div className="control">
              <label>Lọc theo dự án</label>
              <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}>
                <option value="">Tất cả</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
          ) : (
            <div className="users-table">
              <div className="table-row header">
                <div className="table-cell">Title</div>
                <div className="table-cell">Assignee</div>
                <div className="table-cell">Project</div>
                <div className="table-cell">Deadline</div>
                <div className="table-cell">Priority</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Actions</div>
              </div>
              {(filterProjectId ? tasks.filter(t => String(t.projectId) === String(filterProjectId)) : tasks).map(t => {
                const assignee = users.find(u => String(u.id) === String(t.assigneeId));
                const project = projects.find(p => String(p.id) === String(t.projectId));
                return (
                  <div key={t.id} className="table-row">
                    <div className="table-cell"><strong>{t.title}</strong><div style={{ color: '#666' }}>{t.description}</div></div>
                    <div className="table-cell">{assignee ? (assignee.fullName || assignee.email) : '—'}</div>
                    <div className="table-cell">{project ? project.name : '—'}</div>
                    <div className="table-cell">{t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}</div>
                    <div className="table-cell">{t.priority || 'medium'}</div>
                    <div className="table-cell">
                      <button
                        className="btn btn-secondary"
                        onClick={async () => {
                          const next = t.status === 'pending' ? 'in_progress' : (t.status === 'in_progress' ? 'done' : 'pending');
                          try {
                            const res = await axios.put(`${API_CONFIG.LOCAL_API_URL}/tasks/${t.id}`, { status: next }, authHeaders());
                            setTasks(prev => prev.map(x => x.id === t.id ? res.data : x));
                          } catch (e) {
                            alert(e?.response?.data?.message || 'Không đổi được trạng thái');
                          }
                        }}
                      >{t.status}</button>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button onClick={() => startEdit(t)} className="edit-button" title="Edit">✏️</button>
                        {isAdmin && <button onClick={() => handleDelete(t.id)} className="delete-button" title="Delete">🗑️</button>}
                        <label className="edit-button" title="Attach">
                          📎
                          <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                            if (!e.target.files?.length) return;
                            try {
                              const formData = new FormData();
                              formData.append('file', e.target.files[0]);
                              const res = await axios.post(`${API_CONFIG.LOCAL_API_URL}/tasks/${t.id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token || localStorage.getItem('token') || ''}` } });
                              setTasks(prev => prev.map(x => x.id === t.id ? res.data : x));
                            } catch (err) {
                              alert(err?.response?.data?.message || 'Upload file thất bại');
                            } finally {
                              e.target.value = '';
                            }
                          }} />
                        </label>
                      </div>
                      {Array.isArray(t.attachments) && t.attachments.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {t.attachments.map(att => (
                            <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <a href={att.url} target="_blank" rel="noreferrer">{att.originalName}</a>
                              {(isAdmin || String(user?.id) === String(t.assigneeId)) && (
                                <button className="delete-button" title="Remove" onClick={async () => {
                                  try {
                                    const res = await axios.delete(`${API_CONFIG.LOCAL_API_URL}/tasks/${t.id}/attachments/${att.id}`, authHeaders());
                                    setTasks(prev => prev.map(x => x.id === t.id ? res.data : x));
                                  } catch (err) {
                                    alert(err?.response?.data?.message || 'Xóa file thất bại');
                                  }
                                }}>✖</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskManagement;


