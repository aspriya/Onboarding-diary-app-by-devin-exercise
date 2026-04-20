import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Users, ChevronRight } from 'lucide-react';

interface Recruit {
  id: string;
  name: string;
  email: string;
  department: string | null;
  startDate: string | null;
  createdAt: string;
}

interface RecruitDashboard {
  recruit: { id: string; name: string; email: string; department: string | null; startDate: string | null };
  summary: {
    tasks: { total: number; completed: number };
    issues: { open: number };
    feedback: { total: number };
    notes: { total: number };
  };
}

export default function ManagerPage() {
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [selected, setSelected] = useState<RecruitDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: Recruit[] }>('/manager/recruits');
        setRecruits(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const viewRecruit = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get<{ data: RecruitDashboard }>(`/manager/recruits/${id}`);
      setSelected(res.data);
    } catch {
      alert('Failed to load recruit data');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Recruit Overview</h1>
        <p className="text-text-secondary mt-1">View onboarding progress for all recruits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-primary" />
              <h3 className="font-semibold text-text-primary">Recruits ({recruits.length})</h3>
            </div>
            {loading ? (
              <p className="text-text-secondary text-sm">Loading...</p>
            ) : recruits.length === 0 ? (
              <p className="text-text-secondary text-sm">No recruits found</p>
            ) : (
              <div className="space-y-1">
                {recruits.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => viewRecruit(r.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      selected?.recruit.id === r.id ? 'bg-primary/10 border border-primary/20' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{r.name}</p>
                      <p className="text-xs text-text-secondary">{r.department || 'No department'}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {detailLoading ? (
            <div className="card p-8 text-center text-text-secondary">Loading recruit data...</div>
          ) : selected ? (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-semibold text-text-primary text-lg">{selected.recruit.name}</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {selected.recruit.email} &middot; {selected.recruit.department || 'No department'} &middot;
                  Started {selected.recruit.startDate ? new Date(selected.recruit.startDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Tasks', value: selected.summary.tasks.total, color: 'text-primary' },
                  { label: 'Completed', value: selected.summary.tasks.completed, color: 'text-green-500' },
                  { label: 'Open Issues', value: selected.summary.issues.open, color: 'text-accent' },
                  { label: 'Feedback', value: selected.summary.feedback.total, color: 'text-success' },
                ].map((item) => (
                  <div key={item.label} className="card p-4 text-center">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-text-secondary mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {selected.summary.tasks.total > 0 && (
                <div className="card p-5">
                  <h4 className="font-medium text-text-primary mb-3">Task Completion</h4>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${(selected.summary.tasks.completed / selected.summary.tasks.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {Math.round((selected.summary.tasks.completed / selected.summary.tasks.total) * 100)}% complete
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-text-secondary">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p>Select a recruit to view their onboarding progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
