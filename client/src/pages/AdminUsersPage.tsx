import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Plus, Edit2, UserX, Search } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'recruit' | 'manager' | 'admin';
  department: string | null;
  startDate: string | null;
  isActive: boolean;
  createdAt: string;
}

interface UserForm {
  email: string;
  password: string;
  name: string;
  role: 'recruit' | 'manager' | 'admin';
  department: string;
  startDate: string;
}

const emptyForm: UserForm = { email: '', password: '', name: '', role: 'recruit', department: '', startDate: '' };

const roleBadge: Record<string, string> = {
  recruit: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  manager: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  admin: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (roleFilter) params.set('role', roleFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const res = await api.get<{ data: User[]; total: number; page: number; totalPages: number }>(
        `/admin/users?${params.toString()}`
      );
      setUsers(res.data);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(true);
  }

  function openEdit(user: User) {
    setForm({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      department: user.department ?? '',
      startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] ?? '' : '',
    });
    setEditingId(user.id);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit() {
    setError('');
    try {
      if (editingId) {
        const payload: Record<string, unknown> = { name: form.name, role: form.role };
        if (form.department) payload.department = form.department;
        if (form.startDate) payload.startDate = form.startDate;
        await api.put(`/admin/users/${editingId}`, payload);
      } else {
        if (!form.email || !form.password || !form.name) {
          setError('Email, password, and name are required');
          return;
        }
        const payload: Record<string, unknown> = {
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
        };
        if (form.department) payload.department = form.department;
        if (form.startDate) payload.startDate = form.startDate;
        await api.post('/admin/users', payload);
      }
      setShowModal(false);
      loadUsers(page);
    } catch (err: unknown) {
      const apiErr = err as { error?: { message?: string } };
      setError(apiErr?.error?.message ?? 'An error occurred');
    }
  }

  async function deactivateUser(id: string) {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers(page);
    } catch {
      alert('Failed to deactivate user');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-1">{total} users total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10 w-full"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-full sm:w-40">
          <option value="">All roles</option>
          <option value="recruit">Recruit</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="text-text-secondary text-center py-8">Loading users...</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left p-3 font-medium text-text-secondary">Name</th>
                  <th className="text-left p-3 font-medium text-text-secondary">Email</th>
                  <th className="text-left p-3 font-medium text-text-secondary">Role</th>
                  <th className="text-left p-3 font-medium text-text-secondary">Department</th>
                  <th className="text-left p-3 font-medium text-text-secondary">Status</th>
                  <th className="text-right p-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-3 text-text-primary font-medium">{u.name}</td>
                    <td className="p-3 text-text-secondary">{u.email}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">{u.department || '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Edit">
                          <Edit2 size={14} className="text-text-secondary" />
                        </button>
                        {u.isActive && (
                          <button onClick={() => deactivateUser(u.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Deactivate">
                            <UserX size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => loadUsers(page - 1)} disabled={page <= 1} className="btn-secondary text-sm disabled:opacity-50">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">Page {page} of {totalPages}</span>
              <button onClick={() => loadUsers(page + 1)} disabled={page >= totalPages} className="btn-secondary text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {editingId ? 'Edit User' : 'Create User'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field w-full" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserForm['role'] })} className="input-field w-full">
                <option value="recruit">Recruit</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field w-full" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Create User'}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
