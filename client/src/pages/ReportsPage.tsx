import { useState } from 'react';
import { Download, FileText, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { api } from '../lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const downloadCsv = async (type: 'tasks' | 'issues') => {
    setLoading(type);
    try {
      const response = await fetch(`/api/reports/${type}/csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(`Failed to download ${type} report`);
    } finally {
      setLoading(null);
    }
  };

  const downloadFullReport = async () => {
    setLoading('full');
    try {
      const res = await api.get<{ data: unknown }>('/reports/full');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'full-onboarding-report.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download full report');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-text-secondary mt-1">Export your onboarding data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Tasks CSV</h3>
              <p className="text-xs text-text-secondary">Export all tasks as CSV</p>
            </div>
          </div>
          <button
            onClick={() => downloadCsv('tasks')}
            disabled={loading === 'tasks'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={16} />
            {loading === 'tasks' ? 'Downloading...' : 'Download'}
          </button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Issues CSV</h3>
              <p className="text-xs text-text-secondary">Export all issues as CSV</p>
            </div>
          </div>
          <button
            onClick={() => downloadCsv('issues')}
            disabled={loading === 'issues'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={16} />
            {loading === 'issues' ? 'Downloading...' : 'Download'}
          </button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Full Report</h3>
              <p className="text-xs text-text-secondary">Complete onboarding data (JSON)</p>
            </div>
          </div>
          <button
            onClick={downloadFullReport}
            disabled={loading === 'full'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download size={16} />
            {loading === 'full' ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
