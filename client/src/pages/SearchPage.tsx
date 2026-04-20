import { useState, useEffect, useCallback } from 'react';
import { Search, CheckSquare, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { api } from '../lib/api';

interface SearchResult {
  type: 'task' | 'issue' | 'feedback' | 'note';
  id: string;
  title: string;
  description: string;
  meta: Record<string, string>;
  updatedAt: string;
}

interface SearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <CheckSquare size={16} className="text-primary" />,
  issue: <AlertTriangle size={16} className="text-accent" />,
  feedback: <MessageSquare size={16} className="text-success" />,
  note: <FileText size={16} className="text-warning" />,
};

const typeColors: Record<string, string> = {
  task: 'bg-primary/10 text-primary',
  issue: 'bg-accent/10 text-accent',
  feedback: 'bg-success/10 text-success',
  note: 'bg-warning/10 text-warning',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (p: number) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query.trim(), page: String(p), limit: '20' });
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get<SearchResponse>(`/search?${params.toString()}`);
      setResults(res.data);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setSearched(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [query, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        doSearch(1);
      } else {
        setResults([]);
        setTotal(0);
        setSearched(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, typeFilter, doSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Search</h1>
        <p className="text-text-secondary mt-1">Search across all your entries</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, issues, feedback, notes..."
              className="input-field pl-10 w-full"
              autoFocus
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-full sm:w-40"
          >
            <option value="">All types</option>
            <option value="task">Tasks</option>
            <option value="issue">Issues</option>
            <option value="feedback">Feedback</option>
            <option value="note">Notes</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-text-secondary text-center">Searching...</p>}

      {!loading && searched && (
        <div>
          <p className="text-sm text-text-secondary mb-4">
            {total} result{total !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="card p-8 text-center">
              <Search size={40} className="mx-auto mb-3 text-text-secondary opacity-50" />
              <p className="text-text-secondary">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <div key={`${item.type}-${item.id}`} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{typeIcons[item.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                          {item.type}
                        </span>
                        {Object.entries(item.meta).map(([key, value]) =>
                          value ? (
                            <span key={key} className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {value}
                            </span>
                          ) : null
                        )}
                      </div>
                      <h3 className="font-medium text-text-primary">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-xs text-text-secondary mt-2">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => doSearch(page + 1)}
                disabled={page >= totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
