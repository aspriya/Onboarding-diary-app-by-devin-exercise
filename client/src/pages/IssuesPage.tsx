import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { IssueEntry, PaginatedResponse } from '../types/models';

const severities = ['Low', 'Medium', 'High', 'Critical'] as const;
const statuses = ['Open', 'InProgress', 'Resolved', 'Closed'] as const;

const severityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const statusColors: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  InProgress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

interface IssueForm {
  date: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  resolutionNotes: string;
}

const emptyForm: IssueForm = {
  date: new Date().toISOString().split('T')[0] ?? '',
  title: '',
  description: '',
  severity: 'Medium',
  status: 'Open',
  resolutionNotes: '',
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IssueForm>(emptyForm);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (filterStatus) query += `&status=${filterStatus}`;
      if (filterSeverity) query += `&severity=${filterSeverity}`;
      const res = await api.get<PaginatedResponse<IssueEntry>>(`/issues${query}`);
      setIssues(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterSeverity]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, resolutionNotes: form.resolutionNotes || undefined };
      if (editingId) {
        await api.put(`/issues/${editingId}`, payload);
      } else {
        await api.post('/issues', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchIssues();
    } catch (err: unknown) {
      const apiErr = err as { error?: { message?: string } };
      setError(apiErr?.error?.message || 'Failed to save issue');
    }
  };

  const handleEdit = (issue: IssueEntry) => {
    setForm({
      date: issue.date.split('T')[0] ?? '',
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      status: issue.status,
      resolutionNotes: issue.resolutionNotes || '',
    });
    setEditingId(issue.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await api.delete(`/issues/${id}`);
      fetchIssues();
    } catch {
      setError('Failed to delete issue');
    }
  };

  const showResolution = form.status === 'Resolved' || form.status === 'Closed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Issues</h1>
          <p className="text-text-secondary mt-1">{total} issue{total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Report Issue
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSeverity} onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Severities</option>
          {severities.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background dark:bg-surface rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {editingId ? 'Edit Issue' : 'Report Issue'}
            </h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
              <input type="text" placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required minLength={3} maxLength={200} />
              <textarea placeholder="Description (min 10 characters)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} required minLength={10} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-field">
                  {severities.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {showResolution && (
                <textarea placeholder="Resolution notes (required)" value={form.resolutionNotes} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })} className="input-field" rows={2} required />
              )}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading...</div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <p className="text-lg">No issues reported</p>
          <p className="text-sm mt-1">Click "Report Issue" to log a new issue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-medium text-text-primary truncate">{issue.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[issue.status]}`}>{issue.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[issue.severity]}`}>{issue.severity}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{issue.description}</p>
                {issue.resolutionNotes && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 italic">Resolution: {issue.resolutionNotes}</p>
                )}
                <span className="text-xs text-text-secondary mt-2 block">{new Date(issue.date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(issue)} className="p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(issue.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronLeft size={18} /></button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
}
