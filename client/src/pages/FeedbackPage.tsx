import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { FeedbackEntry, PaginatedResponse } from '../types/models';

const feedbackTypes = ['Positive', 'Suggestion', 'Concern'] as const;

const typeColors: Record<string, string> = {
  Positive: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Suggestion: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Concern: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

interface FeedbackForm {
  date: string;
  subject: string;
  type: string;
  details: string;
}

const emptyForm: FeedbackForm = {
  date: new Date().toISOString().split('T')[0] ?? '',
  subject: '',
  type: 'Positive',
  details: '',
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeedbackForm>(emptyForm);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (filterType) query += `&type=${filterType}`;
      const res = await api.get<PaginatedResponse<FeedbackEntry>>(`/feedback${query}`);
      setFeedback(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/feedback/${editingId}`, form);
      } else {
        await api.post('/feedback', form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchFeedback();
    } catch (err: unknown) {
      const apiErr = err as { error?: { message?: string } };
      setError(apiErr?.error?.message || 'Failed to save feedback');
    }
  };

  const handleEdit = (entry: FeedbackEntry) => {
    setForm({
      date: entry.date.split('T')[0] ?? '',
      subject: entry.subject,
      type: entry.type,
      details: entry.details,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      fetchFeedback();
    } catch {
      setError('Failed to delete feedback');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Feedback</h1>
          <p className="text-text-secondary mt-1">{total} entr{total !== 1 ? 'ies' : 'y'} total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Feedback
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Types</option>
          {feedbackTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background dark:bg-surface rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {editingId ? 'Edit Feedback' : 'New Feedback'}
            </h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
              <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" required minLength={3} maxLength={200} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                {feedbackTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea placeholder="Details (min 10 characters)" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="input-field" rows={4} required minLength={10} />
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
      ) : feedback.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <p className="text-lg">No feedback yet</p>
          <p className="text-sm mt-1">Click "Add Feedback" to share your onboarding experience</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((entry) => (
            <div key={entry.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-medium text-text-primary truncate">{entry.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[entry.type]}`}>{entry.type}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 line-clamp-3">{entry.details}</p>
                <span className="text-xs text-text-secondary mt-2 block">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(entry)} className="p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(entry.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 size={16} /></button>
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
