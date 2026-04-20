import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../lib/api';

interface BreakdownItem {
  [key: string]: string | number;
}

interface WeeklyItem {
  week: string;
  total: number;
  completed: number;
}

const COLORS = ['#6C63FF', '#FF6B6B', '#51CF66', '#FFD43B', '#4FC3F7', '#AB47BC'];

export default function ChartsPage() {
  const [taskStatus, setTaskStatus] = useState<BreakdownItem[]>([]);
  const [taskCategory, setTaskCategory] = useState<BreakdownItem[]>([]);
  const [issueSeverity, setIssueSeverity] = useState<BreakdownItem[]>([]);
  const [feedbackType, setFeedbackType] = useState<BreakdownItem[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ts, tc, is, ft, wp] = await Promise.all([
          api.get<{ data: BreakdownItem[] }>('/analytics/task-status'),
          api.get<{ data: BreakdownItem[] }>('/analytics/task-category'),
          api.get<{ data: BreakdownItem[] }>('/analytics/issue-severity'),
          api.get<{ data: BreakdownItem[] }>('/analytics/feedback-type'),
          api.get<{ data: WeeklyItem[] }>('/analytics/weekly-progress'),
        ]);
        setTaskStatus(ts.data);
        setTaskCategory(tc.data);
        setIssueSeverity(is.data);
        setFeedbackType(ft.data);
        setWeeklyProgress(wp.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-text-secondary">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-1">Visual breakdown of your onboarding progress</p>
      </div>

      {/* Weekly Progress Bar Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-text-primary mb-4">Weekly Task Progress (Last 4 Weeks)</h3>
        {weeklyProgress.length === 0 ? (
          <p className="text-text-secondary text-sm">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e2e8f0)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#6C63FF" name="Total Tasks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#51CF66" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Status Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Tasks by Status</h3>
          {taskStatus.length === 0 ? (
            <p className="text-text-secondary text-sm">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={taskStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {taskStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Task Category Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Tasks by Category</h3>
          {taskCategory.length === 0 ? (
            <p className="text-text-secondary text-sm">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={taskCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {taskCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Issue Severity Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Issues by Severity</h3>
          {issueSeverity.length === 0 ? (
            <p className="text-text-secondary text-sm">No issues yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={issueSeverity} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={80} label>
                  {issueSeverity.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Feedback Type Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">Feedback by Type</h3>
          {feedbackType.length === 0 ? (
            <p className="text-text-secondary text-sm">No feedback yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={feedbackType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                  {feedbackType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
