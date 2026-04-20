import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tasks', count: 0, color: 'bg-primary dark:bg-primary-dark' },
          { label: 'Issues', count: 0, color: 'bg-accent dark:bg-accent-dark' },
          { label: 'Feedback', count: 0, color: 'bg-success dark:bg-success-dark' },
          { label: 'Notes', count: 0, color: 'bg-warning dark:bg-warning-dark' },
        ].map((item) => (
          <div key={item.label} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                {item.label}
              </p>
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
            </div>
            <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mt-2">
              {item.count}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
          Welcome, {user?.name}!
        </h3>
        <p className="text-text-secondary dark:text-text-secondary-dark">
          This is your onboarding diary dashboard. Start by creating task entries, logging issues,
          and capturing feedback about your onboarding experience. More features coming in Phase 2!
        </p>
        <div className="mt-4 p-4 rounded-input bg-primary/5 dark:bg-primary-dark/10 border border-primary/20 dark:border-primary-dark/20">
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            <span className="font-medium text-primary dark:text-primary-dark">Role:</span> {user?.role} &bull;{' '}
            <span className="font-medium text-primary dark:text-primary-dark">Department:</span> {user?.department || 'Not set'} &bull;{' '}
            <span className="font-medium text-primary dark:text-primary-dark">Started:</span>{' '}
            {user?.startDate ? new Date(user.startDate).toLocaleDateString() : 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}
