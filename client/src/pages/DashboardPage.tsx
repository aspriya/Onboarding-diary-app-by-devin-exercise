import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { CheckSquare, AlertTriangle, MessageSquare, FileText } from 'lucide-react';

interface DashboardSummary {
  tasks: { total: number; completed: number; inProgress: number; blocked: number };
  issues: { total: number; open: number; resolved: number };
  feedback: { total: number };
  notes: { total: number };
}

interface ActivityItem {
  type: 'task' | 'issue' | 'feedback' | 'note';
  id: string;
  title: string;
  meta: string;
  updatedAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <CheckSquare size={14} className="text-primary" />,
  issue: <AlertTriangle size={14} className="text-accent" />,
  feedback: <MessageSquare size={14} className="text-success" />,
  note: <FileText size={14} className="text-warning" />,
};

const typeLabels: Record<string, string> = {
  task: 'Task',
  issue: 'Issue',
  feedback: 'Feedback',
  note: 'Note',
};

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, actRes] = await Promise.all([
          api.get<{ data: DashboardSummary }>('/dashboard/summary'),
          api.get<{ data: ActivityItem[] }>('/dashboard/activity'),
        ]);
        setSummary(sumRes.data);
        setActivity(actRes.data);
      } catch {
        // silently fail, show zeros
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: 'Tasks', count: summary?.tasks.total ?? 0, sub: `${summary?.tasks.completed ?? 0} completed`, icon: <CheckSquare size={20} />, color: 'text-primary bg-primary/10' },
    { label: 'Issues', count: summary?.issues.total ?? 0, sub: `${summary?.issues.open ?? 0} open`, icon: <AlertTriangle size={20} />, color: 'text-accent bg-accent/10' },
    { label: 'Feedback', count: summary?.feedback.total ?? 0, sub: 'entries', icon: <MessageSquare size={20} />, color: 'text-success bg-success/10' },
    { label: 'Notes', count: summary?.notes.total ?? 0, sub: 'entries', icon: <FileText size={20} />, color: 'text-warning bg-warning/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-secondary">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
            </div>
            <p className="text-3xl font-bold text-text-primary">{loading ? '\u2014' : card.count}</p>
            <p className="text-xs text-text-secondary mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary && (
          <div className="card p-5">
            <h3 className="font-semibold text-text-primary mb-4">Task Progress</h3>
            <div className="space-y-3">
              {[
                { label: 'Completed', count: summary.tasks.completed, color: 'bg-green-500' },
                { label: 'In Progress', count: summary.tasks.inProgress, color: 'bg-blue-500' },
                { label: 'Blocked', count: summary.tasks.blocked, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-primary font-medium">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: summary.tasks.total > 0 ? `${(item.count / summary.tasks.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-text-secondary text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                  <div className="mt-0.5">{typeIcons[item.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span>{typeLabels[item.type]}</span>
                      {item.meta && <span>&middot; {item.meta}</span>}
                      <span>&middot; {new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-text-primary">{user?.name}</p>
            <p className="text-sm text-text-secondary">
              {user?.role} &middot; {user?.department || 'No department'} &middot; Started {user?.startDate ? new Date(user.startDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
