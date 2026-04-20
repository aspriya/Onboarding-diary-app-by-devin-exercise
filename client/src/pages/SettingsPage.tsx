import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import type { User, ApiError } from '../types/auth';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    startDate: user?.startDate ? user.startDate.split('T')[0] : '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const { user: updatedUser } = await api.put<{ user: User }>('/auth/me', {
        name: formData.name,
        department: formData.department || undefined,
        startDate: formData.startDate || undefined,
        themePreference: theme,
      });
      updateUser(updatedUser);
      setMessage('Settings saved successfully');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.error?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        Settings
      </h2>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        {message && (
          <div className="p-3 rounded-input bg-success/10 border border-success dark:border-success-dark text-success dark:text-success-dark text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-input bg-accent/10 border border-accent dark:border-accent-dark text-accent dark:text-accent-dark text-sm">
            {error}
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
            Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="input-field"
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed capitalize"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
            Appearance
          </h3>

          <div className="flex gap-4">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="theme"
                  value={option}
                  checked={theme === option}
                  onChange={() => setTheme(option)}
                  className="w-4 h-4 text-primary dark:text-primary-dark"
                />
                <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark capitalize">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
