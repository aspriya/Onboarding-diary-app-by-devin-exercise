import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../types/auth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    startDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name must contain only letters and spaces';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain an uppercase letter';
    }
    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a number';
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain a special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department || undefined,
        startDate: formData.startDate || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.error?.details) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(apiError.error.details)) {
          fieldErrors[key] = messages[0] || 'Invalid';
        }
        setErrors(fieldErrors);
      } else {
        setGeneralError(apiError?.error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4 py-8 transition-colors duration-200">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Create Account
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-2">
            Start your onboarding journey
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-input bg-accent/10 border border-accent dark:border-accent-dark text-accent dark:text-accent-dark text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="input-field"
              placeholder="Jane Doe"
              required
            />
            {errors.name && <p className="text-accent dark:text-accent-dark text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="input-field"
              placeholder="you@company.com"
              required
            />
            {errors.email && <p className="text-accent dark:text-accent-dark text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="input-field"
              placeholder="Min 8 chars, uppercase, number, special"
              required
            />
            {errors.password && <p className="text-accent dark:text-accent-dark text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="input-field"
              placeholder="Repeat your password"
              required
            />
            {errors.confirmPassword && <p className="text-accent dark:text-accent-dark text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Department <span className="text-text-secondary dark:text-text-secondary-dark">(optional)</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
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
              Start Date <span className="text-text-secondary dark:text-text-secondary-dark">(optional)</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary dark:text-text-secondary-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-primary dark:text-primary-dark hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
