import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to create account. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-screen lined-paper flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-bark-dark rounded-lg flex items-center justify-center">
            <PenLine size={18} className="text-bark-cream" />
          </div>
          <span className="text-bark-dark font-serif font-bold text-xl tracking-tight">
            WorkspaceAI
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/80 border border-parchment-border rounded-lg px-6 py-7">
          <h1 className="font-serif font-bold text-bark-dark text-xl italic mb-1">
            Create an account
          </h1>
          <p className="text-bark-pale font-serif text-sm mb-6">
            Start managing your tasks smarter
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1.5">
                Name
              </label>
              <input
                type="text"
                className="input-parchment"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1.5">
                Email
              </label>
              <input
                type="email"
                className="input-parchment"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="input-parchment"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-bark-mid mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                className="input-parchment"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-bark w-full py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-parchment-border text-center">
            <p className="text-bark-pale font-serif text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-bark-light hover:text-bark-dark underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-bark-pale font-serif italic text-xs mt-5">
          Your tasks, your pace.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;