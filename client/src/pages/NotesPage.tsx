import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { api } from '../lib/api';
import { NoteEntry, PaginatedResponse } from '../types/models';

interface NoteForm {
  date: string;
  title: string;
  content: string;
  tagsInput: string;
}

const emptyForm: NoteForm = {
  date: new Date().toISOString().split('T')[0] ?? '',
  title: '',
  content: '',
  tagsInput: '',
};

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(emptyForm);
  const [error, setError] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (filterTag) query += `&tags=${filterTag}`;
      const res = await api.get<PaginatedResponse<NoteEntry>>(`/notes${query}`);
      setNotes(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [page, filterTag]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const tags = form.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const payload = {
        date: form.date,
        title: form.title,
        content: form.content || undefined,
        tags,
      };
      if (editingId) {
        await api.put(`/notes/${editingId}`, payload);
      } else {
        await api.post('/notes', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchNotes();
    } catch (err: unknown) {
      const apiErr = err as { error?: { message?: string } };
      setError(apiErr?.error?.message || 'Failed to save note');
    }
  };

  const handleEdit = (note: NoteEntry) => {
    setForm({
      date: note.date.split('T')[0] ?? '',
      title: note.title,
      content: note.content || '',
      tagsInput: note.tags.join(', '),
    });
    setEditingId(note.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch {
      setError('Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notes</h1>
          <p className="text-text-secondary mt-1">{total} note{total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Note
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => { setFilterTag(e.target.value); setPage(1); }}
          className="input-field w-auto"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background dark:bg-surface rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {editingId ? 'Edit Note' : 'New Note'}
            </h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required />
              <input type="text" placeholder="Note title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required minLength={3} maxLength={200} />
              <textarea placeholder="Content (optional)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={5} />
              <input type="text" placeholder="Tags (comma-separated, e.g. meeting, setup)" value={form.tagsInput} onChange={(e) => setForm({ ...form, tagsInput: e.target.value })} className="input-field" />
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
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-1">Click "Add Note" to start documenting your journey</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-text-primary truncate">{note.title}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(note)} className="p-1.5 text-text-secondary hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 text-text-secondary hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Trash2 size={14} /></button>
                </div>
              </div>
              {note.content && (
                <p className="text-sm text-text-secondary line-clamp-4 mb-3">{note.content}</p>
              )}
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <Tag size={12} className="text-text-secondary" />
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <span className="text-xs text-text-secondary">{new Date(note.date).toLocaleDateString()}</span>
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
