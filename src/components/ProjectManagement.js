import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../constants';
import './UserManagement.css';

const ProjectManagement = () => {
  const { isAdmin, loading: authLoading, token } = useAuth();
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token || localStorage.getItem('token') || ''}` } });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ id: null, name: '', description: '', memberIds: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const reset = () => { setForm({ id: null, name: '', description: '' }); setIsEditing(false); };

  const fetchProjects = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/projects`, authHeaders());
      setProjects(res.data || []);
    } catch (e) {
      setError('Không thể tải danh sách dự án');
    } finally { setLoading(false); }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/users`, authHeaders());
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAllUsers([]);
    }
  };

  useEffect(() => { if (!authLoading && (token || localStorage.getItem('token'))) { fetchProjects(); if (isAdmin) fetchAllUsers(); } }, [authLoading, token, isAdmin]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const createProject = async (e) => {
    e.preventDefault(); if (!isAdmin) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_CONFIG.LOCAL_API_URL}/projects`, { name: form.name, description: form.description, memberIds: form.memberIds }, authHeaders());
      setProjects(prev => [res.data, ...prev]);
      reset();
    } catch (e) {
      setError(e?.response?.data?.message || 'Tạo dự án thất bại');
    } finally { setLoading(false); }
  };

  const startEdit = (p) => { setIsEditing(true); setForm({ id: p.id, name: p.name, description: p.description || '', memberIds: p.memberIds || [] }); };

  const updateProject = async (e) => {
    e.preventDefault(); if (!isAdmin || !form.id) return;
    setLoading(true); setError('');
    try {
      const res = await axios.put(`${API_CONFIG.LOCAL_API_URL}/projects/${form.id}`, { name: form.name, description: form.description, memberIds: form.memberIds }, authHeaders());
      setProjects(prev => prev.map(p => p.id === form.id ? res.data : p));
      reset();
    } catch (e) {
      setError(e?.response?.data?.message || 'Cập nhật dự án thất bại');
    } finally { setLoading(false); }
  };

  const deleteProject = async (id) => {
    if (!isAdmin) return; if (!window.confirm('Xóa dự án này?')) return;
    setLoading(true); setError('');
    try {
      await axios.delete(`${API_CONFIG.LOCAL_API_URL}/projects/${id}`, authHeaders());
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Xóa dự án thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="user-management-container">
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Project Management</h1>
            <p>Admin quản lý dự án. Nhân viên chỉ xem.</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchProjects} className="back-button" disabled={loading}>↻ Refresh</button>
            <button onClick={() => window.location.assign('/dashboard')} className="back-button">← Dashboard</button>
          </div>
        </div>
      </header>

      {error && <div className="message error">{error}</div>}

      <main className="user-management-main">
        <div className="users-table-container">
          {isAdmin && (
            <>
              <div className="table-header"><h2>{isEditing ? 'Cập nhật dự án' : 'Tạo dự án mới'}</h2></div>
              <form onSubmit={isEditing ? updateProject : createProject} className="table-controls">
                <div className="control">
                  <label>Tên dự án</label>
                  <input name="name" value={form.name} onChange={onChange} required />
                </div>
                <div className="control">
                  <label>Mô tả</label>
                  <input name="description" value={form.description} onChange={onChange} />
                </div>
                <div className="control">
                  <label>Thành viên (Staff)</label>
                  <select multiple value={form.memberIds} onChange={(e) => setForm(prev => ({ ...prev, memberIds: Array.from(e.target.selectedOptions).map(o => o.value) }))} style={{ minHeight: 100 }}>
                    {allUsers.filter(u => u.role === 'staff').map(u => (
                      <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                    ))}
                  </select>
                </div>
                <div className="control">
                  <label>&nbsp;</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="create-user-button" disabled={loading}>{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
                    {isEditing && <button type="button" onClick={reset} className="cancel-button">Hủy</button>}
                  </div>
                </div>
              </form>
            </>
          )}

          <div className="table-header" style={{ marginTop: 16 }}><h2>Danh sách dự án ({projects.length})</h2></div>
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
          ) : (
            <div className="users-table">
              <div className="table-row header">
                <div className="table-cell">Tên</div>
                <div className="table-cell">Mô tả</div>
                <div className="table-cell">Thành viên</div>
                <div className="table-cell">Actions</div>
              </div>
              {projects.map(p => (
                <div key={p.id} className="table-row">
                  <div className="table-cell"><strong>{p.name}</strong></div>
                  <div className="table-cell">{p.description || '—'}</div>
                  <div className="table-cell">{Array.isArray(p.memberIds) && p.memberIds.length ? p.memberIds.length + ' thành viên' : '—'}</div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      {isAdmin && <button onClick={() => startEdit(p)} className="edit-button" title="Edit">✏️</button>}
                      {isAdmin && <button onClick={() => deleteProject(p.id)} className="delete-button" title="Delete">🗑️</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectManagement;


