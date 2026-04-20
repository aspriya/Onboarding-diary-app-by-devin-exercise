import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Square, ChevronDown, ChevronUp, Plus, Trash2, Users } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
}

interface AssignedChecklist {
  id: string;
  name: string;
  description: string | null;
  completedAt: string | null;
  createdAt: string;
  items: ChecklistItem[];
}

interface TemplateItem {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  items: TemplateItem[];
}

interface Recruit {
  id: string;
  name: string;
  email: string;
}

export default function ChecklistPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const [tab, setTab] = useState<'my' | 'templates' | 'assign'>('my');
  const [checklists, setChecklists] = useState<AssignedChecklist[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateItems, setTemplateItems] = useState<{ title: string; description: string }[]>([{ title: '', description: '' }]);

  // Assign form
  const [assignTemplateId, setAssignTemplateId] = useState('');
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'my') {
        const res = await api.get<{ data: AssignedChecklist[] }>('/checklists/my');
        setChecklists(res.data);
      } else if (tab === 'templates') {
        const res = await api.get<{ data: Template[] }>('/checklists/templates');
        setTemplates(res.data);
      } else if (tab === 'assign') {
        const [tRes, rRes] = await Promise.all([
          api.get<{ data: Template[] }>('/checklists/templates'),
          api.get<{ data: Recruit[] }>('/manager/recruits'),
        ]);
        setTemplates(tRes.data);
        setRecruits(rRes.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(checklistId: string, itemId: string, currentCompleted: boolean) {
    try {
      await api.put(`/checklists/my/${checklistId}/items/${itemId}`, { isCompleted: !currentCompleted });
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id !== checklistId) return cl;
          return {
            ...cl,
            items: cl.items.map((item) =>
              item.id === itemId ? { ...item, isCompleted: !currentCompleted, completedAt: !currentCompleted ? new Date().toISOString() : null } : item
            ),
          };
        })
      );
    } catch {
      alert('Failed to update item');
    }
  }

  async function createTemplate() {
    if (!templateName.trim() || templateItems.some((i) => !i.title.trim())) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await api.post('/checklists/templates', {
        name: templateName,
        description: templateDesc || undefined,
        items: templateItems.map((item, idx) => ({
          title: item.title,
          description: item.description || undefined,
          sortOrder: idx,
        })),
      });
      setShowTemplateForm(false);
      setTemplateName('');
      setTemplateDesc('');
      setTemplateItems([{ title: '', description: '' }]);
      loadData();
    } catch {
      alert('Failed to create template');
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/checklists/templates/${id}`);
      loadData();
    } catch {
      alert('Failed to delete template');
    }
  }

  async function assignChecklist() {
    if (!assignTemplateId || !assignUserId) {
      alert('Please select a template and recruit');
      return;
    }
    try {
      await api.post('/checklists/assign', { templateId: assignTemplateId, userId: assignUserId });
      alert('Checklist assigned successfully');
      setAssignTemplateId('');
      setAssignUserId('');
    } catch {
      alert('Failed to assign checklist');
    }
  }

  const completedCount = (items: ChecklistItem[]) => items.filter((i) => i.isCompleted).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Checklists</h1>
        <p className="text-text-secondary mt-1">Track your onboarding progress</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'my' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          My Checklists
        </button>
        {isAdmin && (
          <button onClick={() => setTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'templates' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Templates
          </button>
        )}
        {isManagerOrAdmin && (
          <button onClick={() => setTab('assign')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'assign' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Assign
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-text-secondary text-center py-8">Loading...</p>
      ) : tab === 'my' ? (
        <div className="space-y-4">
          {checklists.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckSquare size={40} className="mx-auto mb-3 text-text-secondary opacity-50" />
              <p className="text-text-secondary">No checklists assigned yet</p>
            </div>
          ) : (
            checklists.map((cl) => (
              <div key={cl.id} className="card">
                <button
                  onClick={() => setExpandedId(expandedId === cl.id ? null : cl.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">{cl.name}</h3>
                      {cl.completedAt && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: cl.items.length > 0 ? `${(completedCount(cl.items) / cl.items.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary">
                        {completedCount(cl.items)}/{cl.items.length}
                      </span>
                    </div>
                  </div>
                  {expandedId === cl.id ? <ChevronUp size={18} className="text-text-secondary" /> : <ChevronDown size={18} className="text-text-secondary" />}
                </button>
                {expandedId === cl.id && (
                  <div className="px-4 pb-4 space-y-2">
                    {cl.description && <p className="text-sm text-text-secondary mb-3">{cl.description}</p>}
                    {cl.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${item.isCompleted ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <button onClick={() => toggleItem(cl.id, item.id, item.isCompleted)} className="mt-0.5 flex-shrink-0">
                          {item.isCompleted ? (
                            <CheckSquare size={18} className="text-green-500" />
                          ) : (
                            <Square size={18} className="text-text-secondary" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : tab === 'templates' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowTemplateForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Template
            </button>
          </div>

          {showTemplateForm && (
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-text-primary">Create Template</h3>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="input-field w-full"
              />
              <textarea
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Description (optional)"
                className="input-field w-full"
                rows={2}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Items</p>
                {templateItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...templateItems];
                        const current = updated[idx];
                        if (current) updated[idx] = { title: e.target.value, description: current.description };
                        setTemplateItems(updated);
                      }}
                      placeholder={`Item ${idx + 1} title`}
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...templateItems];
                        const current = updated[idx];
                        if (current) updated[idx] = { title: current.title, description: e.target.value };
                        setTemplateItems(updated);
                      }}
                      placeholder="Description"
                      className="input-field flex-1"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setTemplateItems([...templateItems, { title: '', description: '' }])}
                  className="text-sm text-primary hover:underline"
                >
                  + Add item
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={createTemplate} className="btn-primary">Create</button>
                <button onClick={() => setShowTemplateForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {templates.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-text-secondary">No templates yet</p>
            </div>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-text-primary">{t.name}</h3>
                    {t.description && <p className="text-sm text-text-secondary mt-1">{t.description}</p>}
                    <p className="text-xs text-text-secondary mt-2">{t.items.length} items</p>
                  </div>
                  <button onClick={() => deleteTemplate(t.id)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-primary" />
            <h3 className="font-semibold text-text-primary">Assign Checklist to Recruit</h3>
          </div>
          <select
            value={assignTemplateId}
            onChange={(e) => setAssignTemplateId(e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.items.length} items)</option>
            ))}
          </select>
          <select
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select recruit...</option>
            {recruits.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
            ))}
          </select>
          <button onClick={assignChecklist} className="btn-primary">
            Assign Checklist
          </button>
        </div>
      )}
    </div>
  );
}
