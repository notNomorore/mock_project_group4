import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../constants';
import './UserManagement.css';

const DocumentCenter = () => {
  const { isAdmin, loading: authLoading, token } = useAuth();
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token || localStorage.getItem('token') || ''}` } });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API_CONFIG.LOCAL_API_URL}/files`, authHeaders());
      setFiles(res.data || []);
    } catch (e) {
      setError('Không thể tải tài liệu');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!authLoading && (token || localStorage.getItem('token'))) fetchFiles(); }, [authLoading, token]);

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) return;
    setLoading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', fileInputRef.current.files[0]);
      form.append('description', description);
      form.append('isPublic', String(isPublic));
      const res = await axios.post(`${API_CONFIG.LOCAL_API_URL}/files/upload`, form, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token || localStorage.getItem('token') || ''}` } });
      setFiles(prev => [res.data, ...prev]);
      setDescription(''); setIsPublic(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload thất bại');
    } finally { setLoading(false); }
  };

  const deleteFile = async (id) => {
    if (!window.confirm('Xóa tài liệu này?')) return;
    setLoading(true); setError('');
    try {
      await axios.delete(`${API_CONFIG.LOCAL_API_URL}/files/${id}`, authHeaders());
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Xóa thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="user-management-container" style={{ overflowX: 'hidden' }}>
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Document Center</h1>
            <p>Tài liệu chung do Admin upload. Cả Admin và Staff đều có thể upload.</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchFiles} className="back-button" disabled={loading}>↻ Refresh</button>
            <button onClick={() => window.location.assign('/dashboard')} className="back-button">← Dashboard</button>
          </div>
        </div>
      </header>

      {error && <div className="message error">{error}</div>}

      <main className="user-management-main">
        <div className="users-table-container" style={{ overflowX: 'auto' }}>
          <div className="table-header"><h2>Upload tài liệu</h2></div>
          <form onSubmit={uploadFile} className="table-controls">
            <div className="control">
              <label>Chọn file</label>
              <input type="file" ref={fileInputRef} required />
            </div>
            <div className="control">
              <label>Mô tả</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="control">
              <label>Công khai</label>
              <select value={String(isPublic)} onChange={(e) => setIsPublic(e.target.value === 'true')}>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
            <div className="control">
              <label>&nbsp;</label>
              <button type="submit" className="create-user-button" disabled={loading}>Upload</button>
            </div>
          </form>

          <div className="table-header" style={{ marginTop: 16 }}><h2>Danh sách tài liệu ({files.length})</h2></div>
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
          ) : (
            <div className="users-table">
              <div className="table-row header">
                <div className="table-cell" style={{ minWidth: 220 }}>Tên</div>
                <div className="table-cell" style={{ minWidth: 260 }}>Mô tả</div>
                <div className="table-cell" style={{ minWidth: 140 }}>Kích thước</div>
                <div className="table-cell" style={{ minWidth: 120 }}>Quyền</div>
                <div className="table-cell" style={{ minWidth: 140 }}>Actions</div>
              </div>
              {files.map(f => (
                <div key={f.id} className="table-row" style={{ alignItems: 'center' }}>
                  <div className="table-cell" style={{ wordBreak: 'break-word' }}><a href={f.url} target="_blank" rel="noreferrer">{f.originalName}</a></div>
                  <div className="table-cell" style={{ wordBreak: 'break-word' }}>{f.description || '—'}</div>
                  <div className="table-cell">{(f.size / 1024).toFixed(1)} KB</div>
                  <div className="table-cell">{f.isPublic ? 'Public' : 'Private'}</div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <a className="edit-button" href={f.url} target="_blank" rel="noreferrer" title="View">🔗</a>
                      <button onClick={() => deleteFile(f.id)} className="delete-button" title="Delete">🗑️</button>
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

export default DocumentCenter;


